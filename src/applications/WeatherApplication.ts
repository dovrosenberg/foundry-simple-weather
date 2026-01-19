import moduleJson from '@module';

import { log } from '@/utils/log';

import { WindowPosition } from '@/window/WindowPosition';
import { WindowDrag } from '@/window/windowDrag';
import { WeatherData } from '@/weather/WeatherData';
import { SelectOption, seasonSelections, biomeSelections, Climate, climateSelections, Humidity, humiditySelections, Season, biomeMappings, HexFlowerCell } from '@/weather/climateData';
import { weatherDescriptions } from '@/weather/weatherMap';
import { getManualOptionsBySeason, ManualOption, } from '@/weather/manualWeather';
import { ModuleSettingKeys } from '@/settings/ModuleSettings';
import { isClientGM, localize } from '@/utils/game';
import { GenerateWeather } from '@/weather/GenerateWeather';
import { ModuleSettings } from '@/settings/ModuleSettings';
import { weatherEffects } from '@/weather/WeatherEffects';
import { DisplayOptions } from '@/types/DisplayOptions';
import { Forecast } from '@/weather/Forecast';
import { cleanDate } from '@/utils/calendar';
import { getCalendarAdapter, calendarManager, CalendarDate, } from '@/calendar';

// the solo instance
let weatherApplication: WeatherApplication;

// set the main application; should only be called once
function updateWeatherApplication(weatherApp: WeatherApplication): void {
  weatherApplication = weatherApp;
}

type WeatherApplicationData = {
  isGM: boolean,
  displayDate: string,
  formattedDate: string,
  formattedTime: string,
  weekday: string,
  currentTemperature: string,
  currentDescription: string,
  currentSeasonClass: string,
  biomeSelections: SelectOption[],
  seasonSelections: SelectOption[],
  humiditySelections: SelectOption[],
  climateSelections: SelectOption[],
  manualSelections: {
    value: string;
    text: string;
    valid: boolean;
  }[],
  displayOptions: DisplayOptions,
  hideCalendar: boolean,
  hideCalendarToggle: boolean,
  hideWeather: boolean,
  hideFXToggle: boolean,
  manualPause: boolean,
  fxActive: boolean,
  useCelsius: boolean,
  attachedMode: boolean,
  showAttached: boolean,
  containerClasses: string,
  windowPosition: WindowPosition,
  containerPosition: string,
  hideDialog: boolean,
  showForecast: boolean,
  forecasts: Forecast[],
}

// flag name for storing daily weather on SC notes
const CAL_NOTE_WEATHER_FLAG_NAME = 'dailyWeather';

class WeatherApplication extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static DEFAULT_OPTIONS = {
    popOut: false,  // self-contained window without the extra wrapper
    resizable: false,  // window is fixed size
  };

  static PARTS = {
    main: {
      template: `modules/${moduleJson.id}/templates/weather-dialog.hbs`,
    },
  };

  // Override element getter to return the injected element when in attached mode
  get element(): HTMLElement {
    if (this._attachedMode) {
      // Return the injected element if we have one
      if (this._injectedElement) {
        return this._injectedElement;
      }

      const adapter = getCalendarAdapter();
      if (!adapter)
        throw new Error("No adapter in attached mode in WeatherApplication.element()");
      
      // Otherwise try to find it in the DOM
      const found = document.getElementById(adapter.wrapperElementId) || document.getElementById('swr-container');
      if (found) {
        this._injectedElement = found;
        return found;
      }
    }
    
    // Fall back to the default ApplicationV2 element
    return super.element;
  }

  private _currentWeather: WeatherData;
  private _displayOptions: DisplayOptions;
  private _calendarPresent = false;   // is a calendar present?
  private _manualPause = false;
  private _attachedMode = false;
  private _attachModeHidden = true;   // like _currentlyHidden but have to track separately because that's for managing ready state not popup state

  private _currentClimate: Climate;
  private _currentHumidity: Humidity;
  private _currentBiome: string;
  private _currentSeason: Season; 
  private _currentSeasonSync: boolean;
  private _windowID = 'swr-container';
  private _windowDragHandler = new WindowDrag();
  private _windowPosition: WindowPosition;
  private _currentlyHidden = false;  // for toggling... we DO NOT save this state
  private _injectedElement: HTMLElement | null = null;  // stores the injected element when in attached mode

  constructor() {
    super();

    log(false, 'WeatherApplication construction');

    // set the initial display
    this._displayOptions = ModuleSettings.get(ModuleSettingKeys.displayOptions) || { dateBox: false, weatherBox: true, biomeBar: true, seasonBar: true }    

    // get attached mode
    this._attachedMode = ModuleSettings.get(ModuleSettingKeys.attachToCalendar) || false;
    this._attachModeHidden = true;

    // get whether the manual pause is on
    this._manualPause = ModuleSettings.get(ModuleSettingKeys.manualPause) || false;

    // don't show it until ready() has been called
    this._currentlyHidden = true;

    // get default position or set default
    this._windowPosition = ModuleSettings.get(ModuleSettingKeys.windowPosition) || { left: 100, bottom: 300 }

    void this.setWeather();  
  }

  // draw the window
  public render(options: any = {}): this {
    this.checkSeasonSync();
    
    if (this._attachedMode) {
      // In attached mode, we need to render the template and inject it manually
      // instead of letting ApplicationV2 create its own element
      this._renderInAttachedMode();
      return this;
    } else {
      return super.render(options);
    }
  }

  // Override close to handle attached mode
  close(options?: Application.CloseOptions): Promise<void> {
    if (this._attachedMode) {
      // In attached mode, we don't have a standard application to close
      // Just hide the injected element
      if (this._injectedElement) {
        this._injectedElement.remove();
        this._injectedElement = null;
      }
      return Promise.resolve();
    } else {
      return super.close(options);
    }
  }

  private async _renderInAttachedMode(): Promise<void> {
    const adapter = getCalendarAdapter();
    if (!adapter)
      return;

    // Get the rendered HTML using the template
    const context = await this._prepareContext();
    const template = WeatherApplication.PARTS?.main?.template;
    if (!template) {
      throw new Error('No template found for WeatherApplication');
    }
    
    // Render the template to HTML string
    const htmlString = await renderTemplate(template, context);
    const html = $(htmlString);
    
    // Inject it into the calendar
    const elementId = adapter.inject(html, this._attachModeHidden);
    
    // Set up event listeners - we need to find our injected element first
    const injectedElement = document.getElementById(elementId) || document.getElementById('swr-container');
    if (injectedElement) {
      // Store the element reference for event handlers
      this._injectedElement = injectedElement;
      this._onRender(context, {});
    }
  }

  public attachToCalendar() {
    this._attachedMode = true;
  }

  public get attachedMode() { return this._attachedMode; }

  /**
   * This function provides the data that the template can use.
   * 
   * @returns A promise that resolves to the data the template can use.
   */
  override async _prepareContext(): Promise<WeatherApplicationData> {
    const adapter = calendarManager.getAdapter();

    const data = {
      ...(await super._prepareContext()),
      isGM: isClientGM(),
      displayDate: this._currentWeather?.date?.display ? this._currentWeather.date.display.date : '',
      formattedDate: this._currentWeather?.date ? this._currentWeather.date.day + '/' + this._currentWeather.date.month + '/' + this._currentWeather.date.year : '',
      formattedTime: this._currentWeather?.date?.display ? this._currentWeather.date.display.time : '',
      weekday: this._currentWeather?.date?.weekday ? this._currentWeather?.date?.weekday : '',
      currentTemperature: this._currentWeather ? this._currentWeather.getTemperature(ModuleSettings.get(ModuleSettingKeys.useCelsius)) : '',
      currentDescription: this._currentWeather ? this._currentWeather.getDescription() : '',
      currentSeasonClass: this.currentSeasonClass(),
      biomeSelections: biomeSelections,
      seasonSelections: seasonSelections,
      humiditySelections: humiditySelections,
      climateSelections: climateSelections,
      manualSelections: getManualOptionsBySeason(this._currentSeason, this._currentClimate, this._currentHumidity),
      selectedManualOption: this.getSelectedManualOption() || getManualOptionsBySeason(this._currentSeason, this._currentClimate, this._currentHumidity)[0],
      displayOptions: this._displayOptions,
      hideCalendar: this._attachedMode || !this._calendarPresent || !this._displayOptions.dateBox,
      hideCalendarToggle: this._attachedMode || !this._calendarPresent,
      hideWeather: !this._attachedMode && this._calendarPresent && !this._displayOptions.weatherBox,  // can only hide weather if calendar present and setting is off
      hideFXToggle: !weatherEffects.useFX,
      manualPause: this._manualPause,
      fxActive: weatherEffects.fxActive,
      useCelsius: ModuleSettings.get(ModuleSettingKeys.useCelsius),
      attachedMode: this._attachedMode,
      showAttached: this._attachedMode && !this._attachModeHidden,
      wrapperElementId: !this._attachedMode || !adapter ? '' : adapter.wrapperElementId,
      containerClasses: !this._attachedMode || !adapter ? '' : adapter.containerClasses,
      windowPosition: this._attachedMode ? { bottom: 0, left: 0 } : this._windowPosition,
      containerPosition: this._attachedMode ? 'relative' : 'fixed',
      // For attached mode, we only hide if _attachModeHidden is true
      // For non-attached mode, we hide if _currentlyHidden is true or if the user is not a GM and dialogDisplay is false
      hideDialog: (this._attachedMode && this._attachModeHidden) || 
                 (!this._attachedMode && (this._currentlyHidden || !(isClientGM() || ModuleSettings.get(ModuleSettingKeys.dialogDisplay)))),

      showForecast: isClientGM() && ModuleSettings.get(ModuleSettingKeys.useForecasts),
      forecasts: this.getForecasts(),
    };
    // log(false, data);

    return data;
  }

  /**
   * Updates the position of the weather application window and saves the new position.  Triggers a re-render of the window.
   * We can't use Foundry's setPosition() because it doesn't work for fixed size, non pop-out windows
   * @param newPosition - The new position of the window.
   */
  public updateWindowPosition(newPosition: WindowPosition) {
    this._windowPosition = newPosition;

    // save
    ModuleSettings.set(ModuleSettingKeys.windowPosition, this._windowPosition);

    this.render();
  }

  /**
   * Toggle the visibility of the weather application window.
   */
  public toggleWindow(): void {
    this._currentlyHidden = !this._currentlyHidden;
    this.render();
  }

  /**
   * Toggle the visibility of the weather application when it's in attached mode.
   */
  public toggleAttachModeHidden(): void {
    // Check if multiple calendars are detected
    if (calendarManager.hasMultipleCalendars) {
      ui.notifications?.error(
        `Multiple calendar modules detected. This is a REALLY bad idea. Please disable all but one calendar module to use Simple Weather.`
      );
      this._attachModeHidden = true;
      return;
    }
    
    this._attachModeHidden = !this._attachModeHidden;
    this.render();
  }

  /**
   * Show the weather application window. Make it visible and render it.
   */
  public showWindow(): void {
    // Check if multiple calendars are detected
    if (calendarManager.hasMultipleCalendars) {
      ui.notifications?.error(
        `Multiple calendar modules detected. This is a REALLY bad idea. Please disable all but one calendar module to use Simple Weather.`
      );
      this._currentlyHidden = true;
      return;
    }
    
    this._currentlyHidden = false;
    this.render({ force: true });
  }

  
  /**
   * Attaches event listeners to the HTML elements in the weather application window.
   * This function is called after the window is rendered, and it sets up handlers 
   * for various user interactions such as dropdown changes, button clicks, and 
   * manual input. It also observes changes in the Simple Calendar's attached mode 
   * to manage the visibility of the weather panel. 
   * 
   * Note that saved weather has been reloaded by the time this is called when we're initializing.
   *  
   * This is called on every render!  One-time functionality should be put in ????? 
   * 
   * @param html - The jQuery-wrapped HTML container for the weather application.
   */
  protected _onRender(context: any, options: any): void {
    super._onRender(context, options);
    
    const root = this.element as unknown as HTMLElement;
    const html: JQuery<HTMLElement> = (globalThis as any).$(root);

    // setup handlers and values for everyone

    // GM-only
    if (isClientGM()) {
      // set the drop-down values
      html.find('#swr-climate-selection').val(this._currentClimate);
      html.find('#swr-humidity-selection').val(this._currentHumidity);
      
      if (this._currentSeasonSync) {
        html.find('#swr-season-selection').val('sync');
      } else {
        html.find('#swr-season-selection').val(this._currentSeason);
      }

      html.find('#swr-biome-selection').val(this._currentBiome);  // do this last, because setting climate/humidity clears it

      html.find('#swr-weather-refresh').on('click', this.onWeatherRegenerateClick);
      html.find('#swr-chat-repost').on('click', this.onChatRepost);
      html.find('#swr-biome-selection').on('change', this.onBiomeSelectChange);
      html.find('#swr-climate-selection').on('change', this.onClimateSelectChange);
      html.find('#swr-humidity-selection').on('change', this.onHumiditySelectChange);
      html.find('#swr-season-selection').on('change', this.onSeasonSelectChange);

      html.find('#swr-manual-pause').on('change', this.onManualPauseChange);

      // toggle buttons
      html.find('#swr-season-bar-toggle').on('mousedown', this.onToggleSeasonBar);
      html.find('#swr-biome-bar-toggle').on('mousedown', this.onToggleBiomeBar);
      html.find('#swr-manual-bar-toggle').on('mousedown', this.onToggleManualBar);
      html.find('#swr-fx-toggle').on('mousedown', this.onToggleFX);

      // validation
      // we need to abort keyup/keydown  because simple calendar in compact mode re-renders on every keydown, which then loses our input and eventhandler
      html.find('#swr-manual-temperature').on('keydown', (e: JQuery.KeyDownEvent) => { e.stopPropagation(); });
      html.find('#swr-manual-temperature').on('keyup', (e: JQuery.KeyUpEvent) => { e.stopPropagation(); });
      html.find('#swr-manual-temperature').on('input', (e: JQuery.Event) => { this.onManualTempInput(e) });

      // buttons
      html.find('#swr-manual-submit').on('click', this.onSubmitWeatherClick);

      // select
      html.find('#swr-manual-weather-selection').on('change', this.onManualWeatherChange);

      // if we're in manual mode and there's no temp, set it
      const tempElement = html.find('#swr-manual-temperature');
      if (tempElement && !tempElement.val()) {
        this.onManualWeatherChange(false);
      }

      // watch for sc calendar to open a different panel
      if (this._attachedMode) {
        const adapter = calendarManager.getAdapter();
        if (adapter)
          adapter.activateListeners((hidden: boolean) => {
            this._attachModeHidden = hidden;
          });
      }
    }

    // handle window drag
    html.find('#swr-calendar-move-handle').on('mousedown', this.onMoveHandleMouseDown);
    html.find('#swr-weather-move-handle').on('mousedown', this.onMoveHandleMouseDown);

    // setup handlers and values for everyone
    html.find('#swr-weather-box-toggle').on('click', this.onWeatherToggleClick);
    html.find('#swr-date-box-toggle').on('click', this.onDateToggleClick);
    html.find('#swr-close-button').on('click', this.onCloseClick);
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

  /**
   * Update the position of the window and store it in settings.
   * 
   * @param position - The new position of the window
   */
  private setWindowPosition(position: WindowPosition): void {
    this._windowPosition = position;

    ModuleSettings.set(ModuleSettingKeys.windowPosition, position);

    this.render();
  }

  private onMoveHandleMouseDown = (event: JQuery.MouseDownEvent): void => {
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

  /**
   * Called when the season selection changes to see if we should sync the season with Simple Calendar.
   * If we were previously syncing and Simple Calendar is no longer present, will turn off sync.
   * @param force - if true, will recalculate the season sync even if it's already been set
   */
  public checkSeasonSync(force?: boolean): void {
    // make sure simple calendar is present if we're trying to sync
    // this could happen if we had sync on but then uninstalled calendar and reloaded
    if (!this._calendarPresent && this._currentSeasonSync) {
      this._currentSeasonSync = false;

      // don't update the setting because a) no need... will update if anything changes anyway, and b)
      //    this may be called before the calendar is loaded so we don't want to overwrite it (it will
      //    get requeried later)
      //ModuleSettings.set(ModuleSettingKeys.seasonSync, false);
    }
  }

  // 
  
  /**
   * If GM, loads the module setting values if they don't exist.
   * Also calls ready on the weather effects so that it can activate any FX.
   * 
   * Called after module is loaded with no simple calendar or after simple calendar is loaded. This is 
   * needed so that we can properly handle calendar box and sync.
   */
  public ready(): void {
    // GM-only
    if (isClientGM()) {
      // load the values from settings if missing
      if (this._currentClimate == undefined)
        this._currentClimate = ModuleSettings.get(ModuleSettingKeys.climate);

      if (this._currentHumidity == undefined)
        this._currentHumidity = ModuleSettings.get(ModuleSettingKeys.humidity);

      if (this._currentSeason == undefined)
        this._currentSeason = ModuleSettings.get(ModuleSettingKeys.season);

      if (this._currentSeasonSync == undefined)
        this._currentSeasonSync = ModuleSettings.get(ModuleSettingKeys.seasonSync);

      if (this._currentBiome == undefined)
        this._currentBiome = ModuleSettings.get(ModuleSettingKeys.biome);
    }

    weatherEffects.ready(this._currentWeather);

    this._currentlyHidden = false;
    this.render({ force: true });
  };

  /**
   * Outputs to the console a bunch of information that might be useful for debugging. 
   * @returns {Promise<void>}
   */
  public async debugOutput(): Promise<void> {
    let output = `
simple-weather DEBUG OUTPUT
_______________________________________
isGM: ${isClientGM()}
// displayOptions: ${JSON.stringify(this._displayOptions, null, 2)}
dialogDisplay: ${ModuleSettings.get(ModuleSettingKeys.dialogDisplay)}
calendarPresent: ${this._calendarPresent}
activeCalendarType: ${calendarManager.calendarType}
manualPause: ${this._manualPause}
currentClimate: ${this._currentClimate}
currentHumidity: ${this._currentHumidity}
currentBiome: ${this._currentBiome}
currentSeason: ${this._currentSeason}
currentSeasonSync: ${this._currentSeasonSync}
SW version: ${game.modules?.get('simple-weather')?.version},
Calendar: ${calendarManager.calendarType}
Calendar version: ${calendarManager.currentCalendar.version},
FXMaster version: ${game.modules?.get('fxmaster')?.version},
ModuleSettings.dialogDisplay: ${ModuleSettings.get(ModuleSettingKeys.dialogDisplay)}
ModuleSettings.outputWeatherToChat: ${ModuleSettings.get(ModuleSettingKeys.outputWeatherToChat)}
ModuleSettings.publicChat: ${ModuleSettings.get(ModuleSettingKeys.publicChat)}
ModuleSettings.useFX: ${ModuleSettings.get(ModuleSettingKeys.useFX)}
ModuleSettings.FXByScene: ${ModuleSettings.get(ModuleSettingKeys.FXByScene)}
ModuleSettings.attachToCalendar: ${ModuleSettings.get(ModuleSettingKeys.attachToCalendar)}
ModuleSettings.storeInSCNotes: ${ModuleSettings.get(ModuleSettingKeys.storeInSCNotes)}
ModuleSettings.fxActive: ${ModuleSettings.get(ModuleSettingKeys.fxActive)}
ModuleSettings.lastWeatherData: ${ModuleSettings.get(ModuleSettingKeys.lastWeatherData)}
getData: ${JSON.stringify(await this.getData(), null, 2)}
_______________________________________
    `;


    console.log(output);
  }


  /**
   * Updates the display options of the weather application by merging the provided
   * partial options with the existing display options. The updated display options
   * are then saved to the module settings and the application is re-rendered.
   *
   * @param options - Partial display options to be merged with the current options.
   */
  public updateDisplayOptions(options: Partial<DisplayOptions>): void {
    this._displayOptions = {
      ...this._displayOptions,
      ...options
    }

    // save
    ModuleSettings.set(ModuleSettingKeys.displayOptions, this._displayOptions);

    this.render();
  }

  /**
   * Updates the current date/time showing in the weather dialog.  Generates new weather if the date has changed.
   * 
   * There are two scenarios when generating weather:
   * 1. Normal day advancement: When the date advances by exactly one day (the common case), we preserve 
   *    existing forecasts and don't prompt for confirmation, as users typically want to keep their forecast data.
   * 2. Random date jumps: When users jump around in the calendar (e.g., skipping ahead weeks or months), 
   *    we prompt to confirm whether to overwrite existing forecasts, as this may not be intended.
   * 
   * @param currentDate the CalendarDate object that contains the current date
   */
  public async updateDateTime(currentDate: CalendarDate | null): Promise<void> {
    if (!currentDate)
      return;

    if (this.hasDateChanged(currentDate)) {
      if (isClientGM()) {
        // Check if this is a one-day advancement (normal progression)
        const isOneDayAdvance = this.isOneDayAdvance(currentDate);
        
        if (ModuleSettings.get(ModuleSettingKeys.storeInSCNotes)) {
          // if we're using notes from SC (and have a valid note) pull that weather
          const notes = getCalendarAdapter()?.getNotesForDay(currentDate) || [];
          let foundWeatherNote = false;

          for (let i=0; i<notes.length; i++) {
            if (notes[i]) {
              const note = notes[i] as JournalEntry.ConfiguredInstance;
              const flagData = note.getFlag(moduleJson.id, CAL_NOTE_WEATHER_FLAG_NAME) as WeatherData;
      
              // if it has the flag, it's a prior weather entry - use it
              if (flagData && flagData.temperature!=null && flagData.hexFlowerCell!=null) {
                foundWeatherNote = true;

                this._currentWeather = new WeatherData(
                  flagData.date, 
                  flagData.season,
                  flagData.humidity,
                  flagData.climate,
                  flagData.hexFlowerCell,
                  flagData.temperature
                );

                await this.activateWeather(this._currentWeather);

                // should only be one, so we can skip rest of notes;
                break;
              } else if (flagData) {
                log(false, 'Found a weather note for today, but it\'s corrupt:');
                log(false, flagData);
                break;  // pretend we didn't have any notes
              }
            }
          }

          if (!foundWeatherNote) {
            await this.generateWeather(currentDate, isOneDayAdvance);
          }      
        } else {
          // otherwise generate new weather
          log(false, 'Generate new weather');
          
          await this.generateWeather(currentDate, isOneDayAdvance);
        }
      }

      await this.render();
    } else {
      // always update because the time has likely changed even if the date didn't
      // but we don't need to save the time to the db, because every second
      //    it's getting refreshed 
      this._currentWeather.date = currentDate;
    }
  }

  
  /**
   * Sets the current weather. If the GM has saved weather data, this will load it.
   * If not, and the client is a GM, it will generate new weather. If not a GM, it
   * will not generate new weather.
   * 
   * Called from outside, to load the last weather from the settings.  Also called by player 
   * clients when GM updates the settings.
  */
  public async setWeather(): Promise<void> {
    const weatherData = ModuleSettings.get(ModuleSettingKeys.lastWeatherData);

    // if we have prior date info but Simple Calendar, etc. is no longer installed, we need to clean that up 
    if (weatherData?.date && !calendarManager.hasActiveCalendar) {
      weatherData.date = null;
      await ModuleSettings.set(ModuleSettingKeys.lastWeatherData, weatherData);
    }

    if (weatherData) {
      log(false, 'Using saved weather data');
      log(false, JSON.stringify(weatherData));

      this._currentWeather = weatherData;
      weatherEffects.activateFX(weatherData);
    } else if (isClientGM()) {
      log(false, 'No saved weather data - Generating weather');

      await this.generateWeather(null, false); // initial generation always prompts
    } else {
      log(false, 'Non-GM loaded blank weather');
      log(false, JSON.stringify(game.user));
    }

    await this.render();
  }

  /**
   * Generates new weather based on the current settings and either the given date or today's date.
   * If the module is paused, it does nothing except update the date.  Otherwise, it generates
   * new weather based on the current settings and then activates that weather.
   * @param currentDate the date for which to generate weather, or null to use today's date
   * @param isOneDayAdvance whether the date advanced by exactly one day (used to skip forecast confirmation)
   */
  private async generateWeather(currentDate: CalendarDate | null, isOneDayAdvance: boolean = false): Promise<void> {
    // if we're paused, do nothing (except update the date)
    if (this._manualPause) {
      this._currentWeather.date = currentDate;
    } else {
      const season = this.getSeason();
      
      this._currentWeather = await GenerateWeather.generateWeather(
        this._currentClimate ?? Climate.Temperate, 
        this._currentHumidity ?? Humidity.Modest, 
        season ?? Season.Spring,
        currentDate,
        this._currentWeather || null,
        false,  // forceRegenerate
        false,  // forForecast
        isOneDayAdvance  // pass the one-day advance flag
      );

      await this.activateWeather(this._currentWeather);
    }
  }

  /**
   * Generates weather for a specific manual weather option, temperature, and date.  Will prompt 
   * to overwrite forecasts but only if it's a "natural" "weather
   * 
   * @param currentDate The current date to use, or null if none.
   * @param temperature The temperature to use.
   * @param weatherIndex The index into the set of manual options.
   */
  private async setManualWeather(currentDate: CalendarDate | null, temperature: number, weatherIndex: number): Promise<void> {
    const season = this.getSeason();

    if (season==null)
      throw new Error('Trying to setManualWeather() without season');

    const result = GenerateWeather.createManual(currentDate, season, this._currentClimate, this._currentHumidity, temperature, weatherIndex);
    if (result) {
      this._currentWeather = result;

      // see if we need to generate forecasts
      const options = getManualOptionsBySeason(season, this._currentClimate, this._currentHumidity);   

      // can't forecast if we don't have a date or we're not doing forecasts, or options aren't valid
      const adapter = getCalendarAdapter();
      if (currentDate && ModuleSettings.get(ModuleSettingKeys.useForecasts) && options && options[weatherIndex] && options[weatherIndex].valid && adapter) {
        await GenerateWeather.generateForecast(cleanDate(adapter, currentDate), this._currentWeather, true, false); // manual weather always prompts
      }

      await this.activateWeather(this._currentWeather);
      await this.render();
    }
  }

  /**
   * Generates weather for a specific climate, humidity, and hex flower cell.
   * 
   * @param climate The climate to use.
   * @param humidity The humidity to use.
   * @param hexFlowerCell The hex flower cell to use.
   * 
   * @remarks
   * This function is used by the weather generation options in the configuration window
   * to generate weather for a specific climate, humidity, and hex flower cell.
   * 
   * @internal
   */
  public setSpecificWeather(climate: Climate, humidity: Humidity, hexFlowerCell: HexFlowerCell): void {
    const season = this.getSeason();

    log(false, 'Running weather for ' + weatherDescriptions[climate][humidity][hexFlowerCell]);

    const result = GenerateWeather.createSpecificWeather(this._currentWeather?.date || null, climate, humidity, hexFlowerCell);
    if (result) {
      this._currentWeather = result;
      this.activateWeather(this._currentWeather);
      this.render();
    }
  }

  
/**
 * Marks the calendar as present and triggers a re-render of the application.
 */
  public activateCalendar(): void {
    this._calendarPresent = true;

    this.render();
  }

  
  /**
   * Activates the given weather data; saves to settings, output to chat, display FX, and save to calendar notes if enabled.
   * @param weatherData the WeatherData to activate
   */
  private async activateWeather(weatherData: WeatherData): Promise<void> {
    if (isClientGM()) {
      // Output to chat if enabled
      if (ModuleSettings.get(ModuleSettingKeys.outputWeatherToChat)) {
        GenerateWeather.outputWeatherToChat(weatherData);
      }

      // activate special effects
      await weatherEffects.activateFX(weatherData);

      // if we're saving to the calendar, do that
      if (ModuleSettings.get(ModuleSettingKeys.storeInSCNotes)) {
        await this.saveWeatherToCalendarNote(weatherData);
      }

      // save 
      await ModuleSettings.set(ModuleSettingKeys.lastWeatherData, this._currentWeather);        
    }
  }

  // save the weather to a calendar note
  private async saveWeatherToCalendarNote(weatherData: WeatherData): Promise<void> {
    if (!weatherData.date || !calendarManager.hasActiveCalendar) 
      return;
    
    const adapter = getCalendarAdapter();
    if (!adapter) return;
    
    const noteTitle = 'Simple Weather - Daily Weather';

    // remove any previous note for the day
    const notes = adapter.getNotesForDay(weatherData.date);
    for (let i=0; i<notes.length; i++) {
      if (notes[i]) {
        const note = notes[i] as JournalEntry.ConfiguredInstance;
        const flagData = note.getFlag(moduleJson.id, CAL_NOTE_WEATHER_FLAG_NAME) as WeatherData;

        // if it has the flag, it's a prior weather entry - delete it
        if (flagData) {
          await adapter.removeNote((notes[i]).id);
        }
      }
    }

    // add a new one
    const noteContent = `Todays weather: ${weatherData.getTemperature(ModuleSettings.get(ModuleSettingKeys.useCelsius))} -  ${weatherData.getDescription() }`;

    // create the note and store the weather detail as a flag
    const newNote = await adapter.addNote(noteTitle, noteContent, weatherData.date, weatherData.date, true);
    // Cast to any to access Foundry's setFlag method
    await (newNote as any)?.setFlag(moduleJson.id, CAL_NOTE_WEATHER_FLAG_NAME, weatherData);
  }

  // has the date part changed
  private hasDateChanged(currentDate: CalendarDate): boolean {
    const previous = this._currentWeather?.date;

    if ((!previous && currentDate) || (previous && !currentDate))
      return true;
    if (!previous && !currentDate) 
      return false;

    // previous exists and currentDate exists
    if (this.isDateTimeValid(currentDate)) {
      if (currentDate.day !== previous!.day
          || currentDate.month !== previous!.month
          || currentDate.year !== previous!.year) {
        return true;
      }
    } 
    
    // if either matches or it's invalid (so we don't want to go around updating things)
    return false;
  }

  /**
   * Checks if the current date is exactly one day after the previous date.
   * This is used to determine if we should skip the forecast overwrite confirmation prompt.
   * @param currentDate The new current date
   * @returns true if the date is exactly one day after the previous date
   */
  private isOneDayAdvance(currentDate: CalendarDate): boolean {
    const previous = this._currentWeather?.date;

    // If we don't have a previous date or the current date is invalid, we can't determine
    if (!previous || !this.isDateTimeValid(currentDate) || !this.isDateTimeValid(previous))
      return false;

    const adapter = getCalendarAdapter();
    if (!adapter)
      throw new Error("No adapter in WeatherApplication.isOneDayAdvance()");

    // Convert both dates to timestamps to compare
    const previousTimestamp = adapter.dateToTimestamp(previous);
    const currentTimestamp = adapter.dateToTimestamp(currentDate);

    if (previousTimestamp === null || currentTimestamp === null)
      return false;

    // Calculate the timestamp for exactly one day after the previous date
    const nextDayTimestamp = adapter.timestampPlusInterval(previousTimestamp, { day: 1 });

    // If the current timestamp matches the next day timestamp, it's a one-day advance
    // we also count advances of less than a day the same way
    return currentTimestamp <= nextDayTimestamp;
  }

  private isDateTimeValid(date: CalendarDate): boolean {
    if (date.minute != null && date.day != null &&
    date.month != null && date.year != null) {
      return true;
    }

    return false;
  }

  // access the current selections
  public getSeason(): Season | null {
    if (this._currentSeasonSync) {
      // if the season selector is set to "sync", then pull it off the date instead
      return this._currentWeather.calendarSeason;
    } else {
      return this._currentSeason;
    }
  }

  private onWeatherRegenerateClick = (event): void => {
    event.preventDefault();

    void this.regenerateWeather();
  };

  // just output the current weather to the chat again
  private onChatRepost = (event): void => {
    event.preventDefault();

    if (isClientGM()) {
      GenerateWeather.outputWeatherToChat(this._currentWeather);
    }
  };

  public async regenerateWeather() {
    if (isClientGM()) {
      await this.generateWeather(this._currentWeather?.date || null, false); // regenerate always prompts
      ModuleSettings.set(ModuleSettingKeys.lastWeatherData, this._currentWeather);        
      await this.render();
    }
  }

  private onSeasonSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    if (target.value === 'sync') {
      this._currentSeasonSync = true;
      this._currentSeason = Number(this._currentWeather.calendarSeason);
    } else {
      this._currentSeasonSync = false;
      this._currentSeason = Number(target.value);
    }

    ModuleSettings.set(ModuleSettingKeys.seasonSync, this._currentSeasonSync);
    ModuleSettings.set(ModuleSettingKeys.season, this._currentSeason);

    // render to update the icon and the manual weather list
    this.render();
  };

  private onClimateSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    this._currentClimate = Number(target.value)
    ModuleSettings.set(ModuleSettingKeys.climate, this._currentClimate);

    // set biome to blank because we adjusted manually
    jQuery(document).find('#swr-biome-selection').val('');
    this._currentBiome = '';
    ModuleSettings.set(ModuleSettingKeys.biome, '');

    // force the manual weather dropdown to regenerate
    this.render();
  };

  private onHumiditySelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    this._currentHumidity = Number(target.value);
    ModuleSettings.set(ModuleSettingKeys.humidity, this._currentHumidity);

    // set biome to blank because we adjusted manually
    jQuery(document).find('#swr-biome-selection').val('');
    this._currentBiome = '';
    ModuleSettings.set(ModuleSettingKeys.biome, '');

    // force the manual weather dropdown to regenerate
    this.render();
  };

  private onBiomeSelectChange = (event): void => {
    const target = event.originalEvent?.target as HTMLSelectElement;

    // reset the climate and humidity selects (unless we picked the blank)
    if (!target.value)
      return;

    const biomeMapping = biomeMappings[target.value];
    if (biomeMapping) {
      // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
      this._currentBiome = target.value
      ModuleSettings.set(ModuleSettingKeys.biome, this._currentBiome);

      // update the other selects
      const climate = document.getElementById('swr-climate-selection') as HTMLSelectElement | null;
      if (climate) {
        climate.value = String(biomeMapping.climate);
        this._currentClimate = biomeMapping.climate;
        ModuleSettings.set(ModuleSettingKeys.climate, biomeMapping.climate);
      }
      
      const humidity = document.getElementById('swr-humidity-selection') as HTMLSelectElement | null;
      if (humidity) {
        humidity.value = String(biomeMapping.humidity);
        this._currentHumidity = biomeMapping.humidity;
        ModuleSettings.set(ModuleSettingKeys.humidity, biomeMapping.humidity);
      }
    }

    // force the manual weather dropdown to regenerate
    this.render();
  };

  private onManualPauseChange = (event): void => {
    this.manualPauseToggle();
  };

  public manualPauseToggle() {
    if (isClientGM()) {
      this._manualPause = !this._manualPause;
      ModuleSettings.set(ModuleSettingKeys.manualPause, this._manualPause);

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

  private onToggleFX = async (): Promise<void> => {
    await this.toggleFX();
  }

  public async toggleFX() {
    if (isClientGM()) {
      await weatherEffects.setFxActive(!weatherEffects.fxActive);
      this.render();
    }
  }

  public async setFXActive(value: boolean) {
    if (isClientGM()) {
      await weatherEffects.setFxActive(value);
      this.render();
    }
  }

  private onManualTempInput = (event?: JQuery.Event): void => {
    event?.stopPropagation()
    const btn = document.getElementById('swr-manual-submit') as HTMLButtonElement;

    btn.disabled = !this.isTempValid();
    btn.title = btn.disabled ? localize('labels.manualWeatherDisabled') : localize('labels.manualWeatherSubmit');
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

    if (ModuleSettings.get(ModuleSettingKeys.useCelsius))
      temp = Math.round((temp*9/5)+32);

    void this.setManualWeather(this._currentWeather.date, temp, Number(select.value));
  }

  // returns the currently selected manual option in the dropdown (not necessarily what
  //   the current weather is)
  private getSelectedManualOption = (): {
      value: string;
      text: string;
      weather: ManualOption;
      temperature: number;
      valid: boolean;
  } | null => {
    // set the temperature  based on the selected option
    const select = document.getElementById('swr-manual-weather-selection') as HTMLSelectElement;

    if (!select) 
      return null;

    const selectedValue = select.value;
    const season = this.getSeason();

    if (season===null || !selectedValue)
      return null;

    // find the option
    return getManualOptionsBySeason(season, this._currentClimate, this._currentHumidity)[selectedValue];
  }

  private onManualWeatherChange = async (rerender = true): Promise<void> => {
    const option = this.getSelectedManualOption();

    if (option==null)
      return;

    // fill in temp - but only for valid ones
    const temp = document.getElementById('swr-manual-temperature') as HTMLInputElement;
    if (option.valid) {
      if (ModuleSettings.get(ModuleSettingKeys.useCelsius)) {
        temp.value = Math.round((option.temperature-32)*5/9).toString();
      } else {
        temp.value = option.temperature.toString();
      }
    } else {
      temp.value = '';
    }

    // trigger as if we'd entered it - to update the button status
    this.onManualTempInput()

    if (rerender)
      await this.render();
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

  // load the next few days of forecasts to display
  public getForecasts(): Forecast[] {
    const numForecasts = 7;

    if (!isClientGM() || !this._currentWeather?.date || !ModuleSettings.get(ModuleSettingKeys.useForecasts))
      return [];
    
    const forecasts = [] as Forecast[];

    const adapter = getCalendarAdapter();

    if (!adapter)
      throw new Error('Unable to get adapter in WeatherApplication.getForecasts()');

    let currentTimestamp = this._currentWeather.date ? cleanDate(adapter, this._currentWeather.date) : 0;

    const allForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
    if (!allForecasts || Object.keys(allForecasts).length===0) 
      return [];

    for (let day=1; day<=numForecasts; day++) {
      let forecastTimeStamp;

      const calendarAdapter = getCalendarAdapter();
      if (calendarAdapter) {
        forecastTimeStamp = calendarAdapter.timestampPlusInterval(currentTimestamp, { day: day});
      }
  
      // load the forecast
      const forecast = allForecasts[forecastTimeStamp.toString()];

      if (!forecast)
        return forecasts;

      // validate the forecast or skip it 
      if (WeatherData.validateWeatherParameters(forecast.climate, forecast.humidity, forecast.hexFlowerCell))
        forecasts.push(new Forecast(forecast.timestamp, forecast.climate, forecast.humidity, forecast.hexFlowerCell));
    }

    return forecasts;
  }
}

export {
  weatherApplication,
  WeatherApplication,
  updateWeatherApplication
}