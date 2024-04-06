import moduleJson from '@module';

import { log } from '@/utils/log';

import { WindowPosition } from '@/window/WindowPosition';
import { WindowDrag } from '@/window/windowDrag';
import { WeatherData } from '@/weather/WeatherData';
import { seasonSelections, biomeSelections, Climate, climateSelections, Humidity, humiditySelections, Season, biomeMappings } from '@/weather/climateData';
import { manualSelections, weatherDescriptions } from '@/weather/weatherMap';
import { SettingKeys } from '@/settings/ModuleSettings';
import { isClientGM } from '@/utils/game';
import { generate, outputWeather, createManual, createSpecificWeather } from '@/weather/weatherGenerator';
import { moduleSettings } from '@/settings/ModuleSettings';
import { weatherEffects } from '@/weather/WeatherEffects';
import { DisplayOptions } from '@/types/DisplayOptions';

// the solo instance
let weatherApplication: WeatherApplication;

// set the main application; should only be called once
function updateWeatherApplication(weatherApp: WeatherApplication): void {
  weatherApplication = weatherApp;
}

class WeatherApplication extends Application {
  private _currentWeather: WeatherData;
  private _displayOptions: DisplayOptions;
  private _calendarPresent = false;   // is simple calendar present?
  private _manualPause = false;
  private _attachedMode = false;

  private _currentClimate: Climate;
  private _currentHumidity: Humidity;
  private _currentBiome: string;
  private _currentSeason: Season; 
  private _currentSeasonSync: boolean;
  private _windowID = 'swr-container';
  private _windowDragHandler = new WindowDrag();
  private _windowPosition: WindowPosition;
  private _currentlyHidden = false;  // for toggling... we DO NOT save this state
  private _attachmodeHidden = true;   // like _currentlyHidden but have to track separately because that's for managing ready state not popup state

  constructor() {
    super();

    log(false, 'WeatherApplication construction');

    // set the initial display
    this._displayOptions = moduleSettings.get(SettingKeys.displayOptions) || { dateBox: false, weatherBox: true, biomeBar: true, seasonBar: true }    

    // get whether the manual pause is on
    this._manualPause = moduleSettings.get(SettingKeys.manualPause || false);

    // don't show it until ready() has been called
    this._currentlyHidden = true;

    // get default position or set default
    this._windowPosition = moduleSettings.get(SettingKeys.windowPosition) || { left: 100, bottom: 300 }
    
    this.setWeather();  
  }

  // draw the window
  public render(force?: boolean): void {
    this.checkSeasonSync();

    super.render(force);
  }

  public attachToCalendar() {
    this._attachedMode = true;
  }

  // window options; called by parent class
  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/weather-dialog.hbs`;
    options.popOut = false;  // self-contained window without the extra wrapper
    options.resizable = false;  // window is fixed size

    return options;
  }

  // this provides fields that will be available in the template; called by parent class
  public async getData(): Promise<any> {
    const data = {
      ...(await super.getData()),
      isGM: isClientGM(),
      displayDate: this._currentWeather?.date?.display ? this._currentWeather.date.display.date : '',
      formattedDate: this._currentWeather?.date ? this._currentWeather.date.day + '/' + this._currentWeather.date.month + '/' + this._currentWeather.date.year : '',
      formattedTime: this._currentWeather?.date?.display ? this._currentWeather.date.display.time : '',
      weekday: this._currentWeather?.date ? this._currentWeather.date.weekdays[this._currentWeather.date.dayOfTheWeek] : '',
      currentTemperature: this._currentWeather ? this._currentWeather.getTemperature(moduleSettings.get(SettingKeys.useCelsius)) : '',
      currentDescription: this._currentWeather ? this._currentWeather.getDescription() : '',
      currentSeasonClass: this.currentSeasonClass(),
      biomeSelections: biomeSelections,
      seasonSelections: seasonSelections,
      humiditySelections: humiditySelections,
      climateSelections: climateSelections,
      manualSelections: manualSelections,

      displayOptions: this._displayOptions,
      hideCalendar: this._attachedMode || !this._calendarPresent || !this._displayOptions.dateBox,
      hideCalendarToggle: this._attachedMode || !this._calendarPresent,
      hideWeather: !this._attachedMode && this._calendarPresent && !this._displayOptions.weatherBox,  // can only hide weather if calendar present and setting is off
      hideFXToggle: !weatherEffects.useFX,
      manualPause: this._manualPause,
      fxActive: weatherEffects.fxActive,
      useCelsius: moduleSettings.get(SettingKeys.useCelsius),
      attachedMode: this._attachedMode,
      showAttached: this._attachedMode && !this._attachmodeHidden,
      windowPosition: this._attachedMode ? { bottom: 0, left: 0 } : this._windowPosition,
      containerPosition: this._attachedMode ? 'relative' : 'fixed',
      hideDialog: this._attachmodeHidden || this._currentlyHidden || !(isClientGM() || moduleSettings.get(SettingKeys.dialogDisplay)),  // hide dialog - don't show anything
    };
    //log(false, data);

    return data;
  }

  // move the window
  // we can't use foundry's setPosition() because it doesn't work for fixed size, non popout windows
  public updateWindowPosition(newPosition: WindowPosition) {
    this._windowPosition = newPosition;

    // save
    moduleSettings.set(SettingKeys.windowPosition, this._windowPosition);

    this.render();
  }

  public toggleWindow(): void {
    this._currentlyHidden = !this._currentlyHidden;
    this.render();
  }

  public toggleAttachModeHidden(): void {
    this._attachmodeHidden = !this._attachmodeHidden;
    this.render();
  }

  public showWindow(): void {
    this._currentlyHidden = false;
    this.render();
  }

  // called by the parent class to attach event handlers after window is rendered
  // note that saved weather has been reloaded by the time this is called when we're initializing
  // this is called on every render!  One-time functionality should be put in ????? 
  public async activateListeners(html: JQuery<HTMLElement>): Promise<void> {
    // setup handlers and values for everyone

    // GM-only
    if (isClientGM()) {
      // set the drop-down values
      html.find('#climate-selection').val(this._currentClimate);
      html.find('#humidity-selection').val(this._currentHumidity);
      
      if (this._currentSeasonSync) {
        html.find('#season-selection').val('sync');
      } else {
        html.find('#season-selection').val(this._currentSeason);
      }

      html.find('#biome-selection').val(this._currentBiome);  // do this last, because setting climate/humidity clears it

      html.find('#swr-weather-refresh').on('click', this.onWeatherRegenerateClick);
      html.find('#biome-selection').on('change', this.onBiomeSelectChange);
      html.find('#climate-selection').on('change', this.onClimateSelectChange);
      html.find('#humidity-selection').on('change', this.onHumiditySelectChange);
      html.find('#season-selection').on('change', this.onSeasonSelectChange);

      html.find('#swr-manual-pause').on('change', this.onManualPauseChange);

      // toggle buttons
      html.find('#swr-season-bar-toggle').on('mousedown', this.onToggleSeasonBar);
      html.find('#swr-biome-bar-toggle').on('mousedown', this.onToggleBiomeBar);
      html.find('#swr-manual-bar-toggle').on('mousedown', this.onToggleManualBar);
      html.find('#swr-fx-toggle').on('mousedown', this.onToggleFX);

      // validation
      html.find('#swr-manual-temperature').on('input', this.onManualTempInput);

      // buttons
      html.find('#swr-submit-weather').on('click', this.onSubmitWeatherClick);
    }

    // handle window drag
    html.find('#swr-calendar-move-handle').on('mousedown', this.onMoveHandleMouseDown);
    html.find('#swr-weather-move-handle').on('mousedown', this.onMoveHandleMouseDown);

    // setup handlers and values for everyone
    html.find('#swr-weather-box-toggle').on('click', this.onWeatherToggleClick);
    html.find('#swr-date-box-toggle').on('click', this.onDateToggleClick);
    html.find('#swr-close-button').on('click', this.onCloseClick);

    super.activateListeners(html);
  }

  // event handlers - note arrow functions because otherwise 'this' doesn't work
  private onWeatherToggleClick = (event): void => {
    event.preventDefault();

    this.updateDisplayOptions({ weatherBox: !this._displayOptions.weatherBox })
  };

  private onDateToggleClick = (event): void => {
    event.preventDefault();

    // if we're turning off, need to move the box right to adjust; reverse for turning on
    if (this._displayOptions.dateBox) 
      this._windowPosition.left += document.getElementById('swr-calendar-box')?.offsetWidth || 0;
    else {
      // little tricker to get width when hidden
      const box = document.getElementById('swr-calendar-box');
      if (box) {
        box.style.visibility = 'hidden';  // use visibility to change display temporarily without flashing
        box.style.display = 'block';
        const width = box.offsetWidth;

        this._windowPosition.left -= width || 0;
      }
    }

    this.updateDisplayOptions({ dateBox: !this._displayOptions.dateBox })
  };

  private onCloseClick = (event): void => {
    event.preventDefault();
    this.toggleWindow();   // must be on if we are clicking the button, so this will close it
  }

  private setWindowPosition(position: WindowPosition): void {
    this._windowPosition = position;

    moduleSettings.set(SettingKeys.windowPosition, position);

    this.render();
  }

  private onMoveHandleMouseDown = (event: MouseEvent): void => {
    // only allow drag with left button (also prevents craziness from clicking a button while other is still down)
    if (event.button !== 0)
      return;

    const element = document.getElementById(this._windowID);
    if (element) {
      this._windowDragHandler.start(element, (position: WindowPosition) => {
        // save the new location
        this.setWindowPosition(position);
      });
    }
  };  

  // turn off season sync if calendar not present
  public checkSeasonSync(force?: boolean): void {
    // make sure simple calendar is present if we're trying to sync
    // this could happen if we had sync on but then uninstalled calendar and reloaded
    if (!this._calendarPresent && this._currentSeasonSync) {
      this._currentSeasonSync = false;

      // don't update the setting because a) no need... will update if anything changes anyway, and b)
      //    this may be called before the calendar is loaded so we don't want to overwrite it (it will
      //    get requeried later)
      //moduleSettings.set(SettingKeys.seasonSync, false);
    }
  }

  // call this when either a) foundry loaded and no simple calendar or b) after simple calendar loaded
  // this is needed so that we can properly handle calendar box and sync
  public ready(): void {
    // GM-only
    if (isClientGM()) {
      // load the values from settings if missing
      if (this._currentClimate == undefined)
        this._currentClimate = moduleSettings.get(SettingKeys.climate);

      if (this._currentHumidity == undefined)
        this._currentHumidity = moduleSettings.get(SettingKeys.humidity);

      if (this._currentSeason == undefined)
        this._currentSeason = moduleSettings.get(SettingKeys.season);

      if (this._currentSeasonSync == undefined)
        this._currentSeasonSync = moduleSettings.get(SettingKeys.seasonSync);

      if (this._currentBiome == undefined)
        this._currentBiome = moduleSettings.get(SettingKeys.biome);
    }

    weatherEffects.ready(this._currentWeather);

    this._currentlyHidden = false;
    this.render(true);
  };

  // output a bunch of info that might be useful for debugging
  public async debugOutput(): Promise<void> {
    let output = `
simple-weather DEBUG OUTPUT
_______________________________________
isGM: ${isClientGM()}
displayOptions: ${JSON.stringify(this._displayOptions, null, 2)}
dialogDisplay: ${moduleSettings.get(SettingKeys.dialogDisplay)}
calendarPresent: ${this._calendarPresent}
manualPause: ${this._manualPause}
currentClimate: ${this._currentClimate}
currentHumidity: ${this._currentHumidity}
currentBiome: ${this._currentBiome}
currentSeason: ${this._currentSeason}
currentSeasonSync: ${this._currentSeasonSync}
WeatherEffects.fxActive = ${moduleSettings.get(SettingKeys.fxActive)}
WeatherEffects.useFX = ${moduleSettings.get(SettingKeys.useFX)}
getData: ${JSON.stringify(await this.getData(), null, 2)}
_______________________________________
    `;


    console.log(output);
  }


  public updateDisplayOptions(options: Partial<DisplayOptions>): void {
    this._displayOptions = {
      ...this._displayOptions,
      ...options
    }

    // save
    moduleSettings.set(SettingKeys.displayOptions, this._displayOptions);

    this.render();
  }

  // updates the current date/time showing in the weather dialog
  // generates new weather if the date has changed
  public updateDateTime(currentDate: SimpleCalendar.DateData | null): void {
    if (!currentDate)
      return;

    if (this.hasDateChanged(currentDate)) {
      log(false, 'DateTime has changed');

      if (isClientGM()) {
        log(false, 'Generate new weather');
        
        this.generateWeather(currentDate);
      }
    } else {
      // always update because the time has likely changed even if the date didn't
      // but we don't need to save the time to the db, because every second
      //    it's getting refreshed 
      this._currentWeather.date = currentDate;
    }

    this.render();
  }

  // called from outside, to load the last weather from the settings
  // also called by player clients when GM updates the settings
  public setWeather(): void {
    const weatherData = moduleSettings.get(SettingKeys.lastWeatherData);

    if (weatherData) {
      log(false, 'Using saved weather data');

      this._currentWeather = weatherData;
      weatherEffects.activateFX(weatherData);
    } else if (isClientGM()) {
      log(false, 'No saved weather data - Generating weather');

      this.generateWeather(null);
    }

    this.render();
  }

  // generate weather based on drop-down settings, store locally and update db
  private generateWeather(currentDate: SimpleCalendar.DateData | null): void {
    // if we're paused, do nothing (except update the date)
    if (!this._manualPause) {
      const season = this.getSeason();

      this._currentWeather = generate(
        this._currentClimate ?? Climate.Temperate, 
        this._currentHumidity ?? Humidity.Modest, 
        season ?? Season.Spring, 
        currentDate,
        this._currentWeather || null
      );

      this.activateWeather(this._currentWeather);
    } else {
      this._currentWeather.date = currentDate;
    }
  }

  // temperature is avg temperature to use; weatherIndex is the index into the set of manual options
  private setManualWeather(currentDate: SimpleCalendar.DateData | null, temperature: number, weatherIndex: number): void {
    const season = this.getSeason();

    const result = createManual(currentDate, temperature, weatherIndex);
    if (result) {
      this._currentWeather = result;
      this.activateWeather(this._currentWeather);
      this.render();
    }
  }

  // temperature is avg temperature to use; weatherIndex is the index into the set of manual options
  public setSpecificWeather(climate: Climate, humidity: Humidity, hexFlowerCell: number): void {
    const season = this.getSeason();

    log(false, 'Running weather for ' + weatherDescriptions[climate][humidity][hexFlowerCell]);

    const result = createSpecificWeather(this._currentWeather?.date || null, climate, humidity, hexFlowerCell);
    if (result) {
      this._currentWeather = result;
      this.activateWeather(this._currentWeather);
      this.render();
    }
  }

  // tell us that simple calendar is present
  public activateCalendar(): void {
    this._calendarPresent = true;

    this.render();
  }

  // activate the given weather; save to settings, output to chat, display FX
  private activateWeather(weatherData: WeatherData): void {
    if (isClientGM()) {
      // Output to chat if enabled
      if (moduleSettings.get(SettingKeys.outputWeatherToChat)) {
        outputWeather(weatherData);
      }

      // activate special effects
      weatherEffects.activateFX(weatherData);

      // save 
      moduleSettings.set(SettingKeys.lastWeatherData, this._currentWeather);        
    }
  }

  // has the date part changed
  private hasDateChanged(currentDate: SimpleCalendar.DateData): boolean {
    const previous = this._currentWeather?.date;

    if ((!previous && currentDate) || (previous && !currentDate))
      return true;
    if (!previous && !currentDate) 
      return false;

    if (this.isDateTimeValid(currentDate)) {
      if (currentDate.day !== (previous as SimpleCalendar.DateData).day
          || currentDate.month !== (previous as SimpleCalendar.DateData).month
          || currentDate.year !== (previous as SimpleCalendar.DateData).year) {
        return true;
      }
    } 
    
    // if either matches or it's invalid (so we don't want to go around updating things)
    return false;
  }

  private isDateTimeValid(date: SimpleCalendar.DateData): boolean {
    if (this.isDefined(date.second) && this.isDefined(date.minute) && this.isDefined(date.day) &&
    this.isDefined(date.month) && this.isDefined(date.year)) {
      return true;
    }

    return false;
  }

  private isDefined(value: unknown) {
    return value !== undefined && value !== null;
  }

  // access the current selections
  public getSeason(): Season | null {
    if (this._currentSeasonSync) {
      // if the season selector is set to "sync", then pull it off the date instead
      return this._currentWeather.simpleCalendarSeason;
    } else {
      return this._currentSeason;
    }
  }

  private onWeatherRegenerateClick = (event): void => {
    event.preventDefault();

    this.regenerateWeather();
  };

  public regenerateWeather() {
    if (isClientGM()) {
      this.generateWeather(this._currentWeather?.date || null);
      moduleSettings.set(SettingKeys.lastWeatherData, this._currentWeather);        
      this.render();
    }
  }

  private onSeasonSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    if (target.value === 'sync') {
      this._currentSeasonSync = true;
      this._currentSeason = Number(this._currentWeather.simpleCalendarSeason);
    } else {
      this._currentSeasonSync = false;
      this._currentSeason = Number(target.value);
    }

    moduleSettings.set(SettingKeys.seasonSync, this._currentSeasonSync);
    moduleSettings.set(SettingKeys.season, this._currentSeason);

    // render to update the icon
    this.render();
  };

  private onClimateSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    this._currentClimate = Number(target.value)
    moduleSettings.set(SettingKeys.climate, this._currentClimate);

    // set biome to blank because we adjusted manually
    jQuery(document).find('#biome-selection').val('');
    this._currentBiome = '';
    moduleSettings.set(SettingKeys.biome, '');
  };

  private onHumiditySelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    this._currentHumidity = Number(target.value);
    moduleSettings.set(SettingKeys.humidity, this._currentHumidity);

    // set biome to blank because we adjusted manually
    jQuery(document).find('#biome-selection').val('');
    this._currentBiome = '';
    moduleSettings.set(SettingKeys.biome, '');
  };

  private onBiomeSelectChange = (event): void => {
    const target = event.originalEvent?.target as HTMLSelectElement;

    // reset the climate and humidity selects (unless we pickee the blank)
    if (!target.value)
      return;

    const biomeMapping = biomeMappings[target.value];
    if (biomeMapping) {
      // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
      this._currentBiome = target.value
      moduleSettings.set(SettingKeys.biome, this._currentBiome);

      // update the other selects
      const climate = document.getElementById('climate-selection') as HTMLSelectElement | null;
      if (climate) {
        climate.value = String(biomeMapping.climate);
        this._currentClimate = biomeMapping.climate;
        moduleSettings.set(SettingKeys.climate, biomeMapping.climate);
      }
      
      const humidity = document.getElementById('humidity-selection') as HTMLSelectElement | null;
      if (humidity) {
        humidity.value = String(biomeMapping.humidity);
        this._currentHumidity = biomeMapping.humidity;
        moduleSettings.set(SettingKeys.humidity, biomeMapping.humidity);
      }
    }
  };

  private onManualPauseChange = (event): void => {
    this.manualPauseToggle();
  };

  public manualPauseToggle() {
    if (isClientGM()) {
      this._manualPause = !this._manualPause;
      moduleSettings.set(SettingKeys.manualPause, this._manualPause);

      // if we're turning it on, hide the weather bars
      if (this._manualPause) {
        this.updateDisplayOptions({
          ...this._displayOptions,
          biomeBar: false,
          seasonBar: false,
        })
      }

      this.render();
    }
  }

  private onToggleSeasonBar = (): void => {
    this._displayOptions.seasonBar = !this._displayOptions.seasonBar;

    this.updateDisplayOptions(this._displayOptions);
  }

  private onToggleBiomeBar = (): void => {
    this._displayOptions.biomeBar = !this._displayOptions.biomeBar;

    this.updateDisplayOptions(this._displayOptions);
  }

  private onToggleManualBar = (): void => {
    this._displayOptions.manualBar = !this._displayOptions.manualBar;

    this.updateDisplayOptions(this._displayOptions);
  }

  private onToggleFX = (): void => {
    this.toggleFX();
  }

  public toggleFX() {
    if (isClientGM())
      weatherEffects.fxActive = !weatherEffects.fxActive;
  }

  private onManualTempInput = (event: KeyboardEvent): void => {
    const btn = document.getElementById('swr-submit-weather') as HTMLButtonElement;

    btn.disabled = !this.isTempValid();
  }

  private isTempValid(): boolean {
    const input = document.getElementById('swr-manual-temperature') as HTMLInputElement;
    const inputValue = input?.value;

    // can only be a number
    return (/^-?[0-9]+$/.test(inputValue));
  }

  private onSubmitWeatherClick = (): void => {
    // confirm temp is valid, though the input filter above should prevent this
    const input = document.getElementById('swr-manual-temperature') as HTMLInputElement;
    let temp = Number(input?.value);

    const select = document.getElementById('swr-manual-weather-selection') as HTMLSelectElement;

    if (isNaN(temp) || !select.value) {
      log(false, 'Attempt to submit invalid temperature or no selection');
      return;
    }

    if (moduleSettings.get(SettingKeys.useCelsius))
      temp = Math.round((temp*9/5)+32);

    this.setManualWeather(this._currentWeather?.date || null, temp, Number(select.value));
  }

  // get the class to apply to get the proper icon by season
  private currentSeasonClass = function(): string { 
    switch (this.getSeason()) {
      case Season.Fall: 
        return 'fa-leaf fall';
      
      case Season.Winter: 
        return 'fa-snowflake winter';
      
      case Season.Spring: 
        return 'fa-seedling spring';
      
      case Season.Summer: 
        return 'fa-sun summer';
    }

    return '';
  }

  // override this function to handle the element case
  override _injectHTML(html: JQuery<HTMLElement>) {
    // remove any old one
    $('#swr-fsc-container').remove();

    if (this._attachedMode && !this._attachmodeHidden) {
      // attach to the calendar
      $('#fsc-ng .window-content .fsc-qf .fsc-mf.fsc-c').last().append(html);
      html.hide().fadeIn(200);
    } else if (!this._attachedMode) {
      $('body').append(html);
      html.hide().fadeIn(200);
    }    
  }
}

export {
  weatherApplication,
  WeatherApplication,
  updateWeatherApplication
}