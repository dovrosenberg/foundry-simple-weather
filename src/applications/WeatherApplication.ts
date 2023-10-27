import moduleJson from '@module';

import { log } from '@/utils/log';
import { WeatherData } from '@/weather/WeatherData';
import { seasonSelections, biomeSelections, Climate, climateSelections, Humidity, humiditySelections, Season, biomeMappings } from '@/weather/climateData';
import { WindowPosition } from '@/window/WindowPosition';
import { SettingKeys } from '@/settings/moduleSettings';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';
import { generate, outputWeather } from '@/weather/weatherGenerator';
import { moduleSettings } from '@/settings/moduleSettings';
import { weatherEffects } from '@/weather/WeatherEffects';
import { DisplayOptions } from '@/types/DisplayOptions';

// the solo instance
let weatherApplication: WeatherApplication;

// set the main application; should only be called once
function updateWeatherApplication(weatherApp: WeatherApplication): void {
  weatherApplication = weatherApp;
}

class WeatherApplication extends Application {
  private _ready = false;   // is foundry fully loaded?

  private _currentWeather: WeatherData;
  private _windowID = 'swr-container';
  private _windowDragHandler = new WindowDrag();
  private _windowPosition: WindowPosition;
  private _displayOptions: DisplayOptions;
  private _calendarPresent = false;   // is simple calendar present?

  private _currentClimate: Climate;
  private _currentHumidity: Humidity;
  private _currentBiome: string;
  private _currentSeason: Season; 
  private _currentSeasonSync: boolean;

  constructor() {
    super();

    log(false, 'WeatherApplication construction');

    // set the initial display
    this._displayOptions = moduleSettings.get(SettingKeys.displayOptions) || { dateBox: true, weatherBox: false, biomeBar: true, seasonBar: true }    

    // get default position or set default
    this._windowPosition = moduleSettings.get(SettingKeys.windowPosition) || { left: 100, bottom: 300 }

    this.setWeather();  
  }

  // draw the window
  public render(force?: boolean): void {
    // make sure simple calendar is present if we're trying to sync
    // this could happen if we had sync on but then uninstalled calendar and reloaded
    if (!this._calendarPresent && this._currentSeasonSync) {
      this._currentSeasonSync = false;
      moduleSettings.set(SettingKeys.seasonSync, false);
    }

    super.render(force);
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

      displayOptions: this._displayOptions,
      hideDialog: !this.ready || !(isClientGM() || moduleSettings.get(SettingKeys.dialogDisplay)),  // hide dialog - don't show anything
      hideCalendar: !this._calendarPresent || !this._displayOptions.dateBox,
      hideWeather: this._calendarPresent && !this._displayOptions.weatherBox,  // can only hide weather if calendar present and setting is off
      windowPosition: this._windowPosition,
    };

    return data;
  }

  // call this after simple calendar should have loaded so we know whether to draw the calendar box or not
  public ready(): void {
    this._ready = true;

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

    this.render(true);
  };

  // move the window
  // we can't use foundry's setPosition() because it doesn't work for fixed size, non popout windows
  public updateWindowPosition(newPosition: WindowPosition) {
    this._windowPosition = newPosition;

    // save
    moduleSettings.set(SettingKeys.windowPosition, this._windowPosition);

    this.render();
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

  public activateCalendar(): void {
    this._calendarPresent = true;
    this.render();
  }

  // called by the parent class to attach event handlers after window is rendered
  // note that saved weather has been reloaded by the time this is called when we're initializing
  // this is called on every render!  One-time functionality should be put in ????? 
  public async activateListeners(html: JQuery<HTMLElement>): Promise<void> {
    // handle window drag
    html.find('#swr-calendar-move-handle').on('mousedown', this.onMoveHandleMouseDown);
    html.find('#swr-weather-move-handle').on('mousedown', this.onMoveHandleMouseDown);

    // setup handlers and values for everyone
    html.find('#swr-weather-box-toggle').on('click', this.onWeatherToggleClick);
    html.find('#swr-date-box-toggle').on('click', this.onDateToggleClick);
    html.find('#swr-close-button').on('click', this.onCloseClick);

    // GM-only
    if (isClientGM()) {
      // set the drop-down values
      html.find('#climate-selection').val(this._currentClimate);
      html.find('#humidity-selection').val(this._currentHumidity);
      
      if (this._currentSeasonSync)
        html.find('#season-selection').val('sync');
      else
        html.find('#season-selection').val(this._currentSeason);

      html.find('#biome-selection').val(this._currentBiome);  // do this last, because setting climate/humidity clears it

      html.find('#swr-weather-refresh').on('click', this.onWeatherRegenerateClick);
      html.find('#biome-selection').on('change', this.onBiomeSelectChange);
      html.find('#climate-selection').on('change', this.onClimateSelectChange);
      html.find('#humidity-selection').on('change', this.onHumiditySelectChange);
      html.find('#season-selection').on('change', this.onSeasonSelectChange);

      // toggle buttons
      html.find('#swr-season-bar-toggle').on('mousedown', this.onToggleSeasonBar);
      html.find('#swr-biome-bar-toggle').on('mousedown', this.onToggleBiomeBar);
    }



    super.activateListeners(html);
  }

  // updates the current date/time showing in the weather dialog
  // generates new weather if the date has changed
  public async updateDateTime(currentDate: SimpleCalendar.DateData | null) {
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
    } else if (isClientGM()) {
      log(false, 'No saved weather data - Generating weather');

      this.generateWeather(null);
    }

    this.render();
  }

  // generate weather based on drop-down settings, store locally and update db
  private generateWeather(currentDate: SimpleCalendar.DateData | null): void {
    const season = this.getSeason();

    this._currentWeather = generate(
      this._currentClimate!==null ? this._currentClimate : Climate.Temperate, 
      this._currentHumidity!==null ? this._currentHumidity : Humidity.Modest, 
      season!==null ? season : Season.Spring, 
      currentDate,
      this._currentWeather || null
    );

    this.activateWeather(this._currentWeather);
  }

  // activate the given weather; save to settings, output to chat, display FX
  private activateWeather(weatherData: WeatherData): void {
    // Output to chat if enabled
    if (moduleSettings.get(SettingKeys.outputWeatherToChat)) {
      outputWeather(weatherData);
    }

    // activate special effects
    weatherEffects.activateFX(weatherData);

    // save 
    moduleSettings.set(SettingKeys.lastWeatherData, this._currentWeather);        
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
        box.style.visibility = 'hidden';
        box.style.display = 'block';
        const width = box.offsetWidth;

        this._windowPosition.left -= width || 0;
      }
    }

    this.updateDisplayOptions({ dateBox: !this._displayOptions.dateBox })
  };

  private onCloseClick = (event): void => {
    event.preventDefault();
    this.close();
  }

  private onWeatherRegenerateClick = (event): void => {
    event.preventDefault();

    this.generateWeather(this._currentWeather?.date || null);
    moduleSettings.set(SettingKeys.lastWeatherData, this._currentWeather);        

    this.render();
  };

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

  private setWindowPosition(position: WindowPosition): void {
    this._windowPosition = position;

    moduleSettings.set(SettingKeys.windowPosition, position);

    this.render();
  }

  private onMoveHandleMouseDown = (): void => {
    const element = document.getElementById(this._windowID);
    if (element) {
      this._windowDragHandler.start(element, (position: WindowPosition) => {
        // save the new location
        this.setWindowPosition(position);
      });
    }
  };  

  private onToggleSeasonBar = (): void => {
    this._displayOptions.seasonBar = !this._displayOptions.seasonBar;

    this.updateDisplayOptions(this._displayOptions);
  }

  private onToggleBiomeBar = (): void => {
    this._displayOptions.biomeBar = !this._displayOptions.biomeBar;

    this.updateDisplayOptions(this._displayOptions);
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
}

export {
  weatherApplication,
  WeatherApplication,
  updateWeatherApplication
}