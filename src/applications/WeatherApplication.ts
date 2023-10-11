import moduleJson from '@module';

import { log } from '@/utils/log';
import { WeatherData } from '@/weather/WeatherData';
import { biomeSelections, Climate, Humidity, initializeLocalizedText, Season } from '@/weather/climateData';
import { WindowPosition } from '@/window/WindowPosition';
import { ModuleSettings } from '@/settings/module-settings';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';
import { generate } from '@/weather/weatherGenerator';

export class WeatherApplication extends Application {
  private windowDragHandler: WindowDrag;
  private moduleSettings: ModuleSettings;
  private renderCompleteCallback: (() => SimpleCalendar.DateData | null) | null;
  private currentWeather: WeatherData;
  private weatherPanelOpen: boolean;

  private testvalue = 0;

  // renderCompleteCallback will be called when listeners are activated, so can contain
  //    any logic that needs to be activated at that point
  // it must return the current date from the calendar
  constructor(moduleSettings: ModuleSettings, renderCompleteCallback: (() => SimpleCalendar.DateData | null) | null) {
    super();

    this.moduleSettings = moduleSettings;
    this.renderCompleteCallback = renderCompleteCallback;
    this.weatherPanelOpen = false;

    log(false, 'WeatherApplication construction');

    this.loadInitialWeather();
    this.render(true);
  }

  // window options; called by parent class
  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/weather-dialog.html`;
    options.popOut = false;  // self-contained window without the extra wrapper
    options.resizable = false;  // window is fixed size

    return options;
  }

  // this provides fields that will be available in the template; called by parent class
  public async getData(): Promise<any> {
    const data = {
      ...(await super.getData()),
      isGM: isClientGM(),
      displayDate: this.currentWeather?.date?.display ? this.currentWeather.date.display.date : '',
      formattedDate: this.currentWeather?.date ? this.currentWeather.date.day + '/' + this.currentWeather.date.month + '/' + this.currentWeather.date.year : '',
      formattedTime: this.currentWeather?.date?.display ? this.currentWeather.date.display.time : '',
      weekday: this.currentWeather?.date ? this.currentWeather.date.weekdays[this.currentWeather.date.dayOfTheWeek] : '',
      currentTemperature: this.currentWeather ? this.currentWeather.getTemperature(this.moduleSettings.getUseCelsius()) : '',
      currentDescription: this.currentWeather ? this.currentWeather.getDescription() : '',
      weatherPanelOpen: this.weatherPanelOpen,
      biomeSelections: biomeSelections,
    };

    console.log(JSON.stringify(biomeSelections));
    return data;
  }

  // called by the parent class to attach event handlers after window is rendered
  // note that saved weather has been reloaded by the time this is called when we're initializing
  // this is called on every render!  One-time functionality should be put in ????? 
  public async activateListeners(html: JQuery<HTMLElement>) {
    if (this.renderCompleteCallback) {
      await this.updateDateTime(this.renderCompleteCallback());   // this is really for the very 1st load; after that this date should match what was saved in settings
    }

    // get window in right place and setup drag and drop
    this.initializeWindowInteractions(html);

    // toggle date format when the date is clicked
    html.find('#date-display').on('mousedown', event => {
      event.currentTarget.classList.toggle('altFormat');
    });

    this.listenToWeatherToggle(html);
    this.listenToWeatherRefreshClick(html);
    // //this.setClimate(html);
    this.listenToDropdownsChange(html);

    // // expose a SimpleWeather global object to enable calling resetPosition
    // global.SimpleWeather = {};
    // global.SimpleWeather.resetPosition = () => this.resetPosition();

    // this is important, as it is what triggers refreshes when data changes
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
        //newWeatherData = this.weatherGenerator.generate();

        // we only save if we have a new date/weather because the time will get refreshed when we load anyway
        this.currentWeather.date = currentDate;
        await this.moduleSettings.setLastWeatherData(this.currentWeather);    
      }
    } else {
      // always update because the time has likely changed even if the date didn't
      this.currentWeather.date = currentDate;
    }

    this.render();
  }

  // called from outside, to load the last weather from the settings
  public loadInitialWeather(): void {
    const weatherData = this.moduleSettings.getLastWeatherData();

    log(false, 'loaded weatherData:' + JSON.stringify(weatherData));

    if (weatherData) {
      log(false, 'Using saved weather data');

      this.currentWeather = weatherData;
    } else if (isClientGM()) {
      log(false, 'No saved weather data - Generating weather');
  
      this.currentWeather = generate(this.moduleSettings, Climate.Cold, Humidity.Modest, Season.Spring, null);
    }

    log(false, 'Setting weather: ' + JSON.stringify(this.currentWeather));
    this.render();
  }

  // has the date part changed
  private hasDateChanged(currentDate: SimpleCalendar.DateData): boolean {
    const previous = this.currentWeather.date;

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

  // resets the window's position to the default
  public resetPosition() {
    log(false, 'Resetting position');
    const defaultPosition = { top: 100, left: 100 };
    
    const element = document.getElementById('sweath-container');
    if (element) {
      log(false,'Resetting Window Position');
      element.style.top = defaultPosition.top + 'px';
      element.style.left = defaultPosition.left + 'px';
      this.moduleSettings.setWindowPosition({top: element.offsetTop, left: element.offsetLeft});
      element.style.bottom = '';
    }
  }

  // // listener activators
  private listenToWeatherToggle(html: JQuery) {
    // hide the toggle for non-GM clients
    if (!isClientGM()) {
      const element = document.getElementById('weather-toggle');
      if (element)
        element.style.display = 'none';
    } else {
      // set the handler
      html.find('#weather-toggle').on('click', event => {
        event.preventDefault();

        // we store the state so it's remembered when we rerender, but we also just
        //    update the DOM for performance reasons (vs. forcing a re-render just for this)
        this.weatherPanelOpen = !this.weatherPanelOpen;

        const element = document.getElementById('sweath-container');
        if (element)
          element.classList.toggle('showWeather');
      });
    }
  }

  // event handlers

  private listenToWeatherRefreshClick(html: JQuery) {
    // add the handler
    if (isClientGM()) {
      html.find('#sweath-weather-regenerate').on('click', event => {
        event.preventDefault();
        this.currentWeather = generate(this.moduleSettings, Climate.Cold, Humidity.Barren, Season.Winter, this.currentWeather);

        this.render();
      });
    } 
  }

  private listenToDropdownsChange(html: JQuery) {
    // const climateSelection = ;
    // const biomeSelection = '#biome-selection';
    // const humiditySelection = '#humidity-selection';

    // // NOTE!  The values of the items in the drop-downs must match the enum values
    // html.find('#climate-selection').on('change', (event) => {
    //   const target = event.originalEvent?.target as HTMLSelectElement;
    //   const weatherData = this.weatherGenerator.generate(target?.value as Climates);

    //    rerender?
    // });
  }

  // place the window correctly and setup the drag handler for our dialog
  private initializeWindowInteractions($: JQuery<HTMLElement>) {
    // place the window based on last saved location
    const windowPosition = this.moduleSettings.getWindowPosition();
    const weatherWindow = document.getElementById('sweath-container');

    if (!weatherWindow) return;

    log(false, 'Initializing position');

    weatherWindow.style.top = windowPosition.top + 'px';
    weatherWindow.style.left = windowPosition.left + 'px';

    // listen for drag events
    this.windowDragHandler = new WindowDrag();
    $.find('#sweath-window-move-handle').on('mousedown', () => {
      this.windowDragHandler.start(weatherWindow, (windowPos: WindowPosition) => {
        this.moduleSettings.setWindowPosition(windowPos);
      });
    });
  }

  // private setClimate(html: JQuery) {
  //   const climateSelection = '#climate-selection';
  //   const climateName = this.weatherTracker.getWeatherData().climate?.name || Climates.temperate;
  //   html.find(climateSelection).val(climateName);
  // }

}
