import moduleJson from '@module';

import { log } from '@/utils/log';
import { WeatherData } from '@/weather/WeatherData';
import { seasonSelections, biomeSelections, Climate, climateSelections, Humidity, humiditySelections, Season, biomeMappings } from '@/weather/climateData';
import { WindowPosition } from '@/window/WindowPosition';
import { ModuleSettings, SettingKeys } from '@/settings/module-settings';
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
      currentTemperature: this.currentWeather ? this.currentWeather.getTemperature(this.moduleSettings.get(SettingKeys.useCelsius)) : '',
      currentDescription: this.currentWeather ? this.currentWeather.getDescription() : '',
      weatherPanelOpen: this.weatherPanelOpen,
      biomeSelections: biomeSelections,
      seasonSelections: seasonSelections,
      humiditySelections: humiditySelections,
      climateSelections: climateSelections,
    };

    //console.log(JSON.stringify(biomeSelections));
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

    // //this.setClimate(html);

    // // expose a SimpleWeather global object to enable calling resetPosition
    // global.SimpleWeather = {};
    // global.SimpleWeather.resetPosition = () => this.resetPosition();

    // set the drop-down values
    html.find('#climate-selection').val(this.moduleSettings.get(SettingKeys.climate));
    html.find('#humidity-selection').val(this.moduleSettings.get(SettingKeys.humidity));
    html.find('#season-selection').val(this.moduleSettings.get(SettingKeys.season));
    html.find('#biome-selection').val(this.moduleSettings.get(SettingKeys.biome));


    // add the handlers
    if (isClientGM()) {
      log(false, 'here');
      html.find('#sweath-weather-regenerate').on('click', this.onWeatherRegenerateClick);
      html.find('#weather-toggle').on('click', this.onWeatherToggleClick);
      html.find('#biome-selection').on('change', this.onBiomeSelectChange);
      html.find('#climate-selection').on('change', this.onClimateSelectChange);
      html.find('#humidity-selection').on('change', this.onHumiditySelectChange);
    } else {
      // hide stuff
      const element = document.getElementById('weather-toggle');
      if (element)
        element.style.display = 'none';
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
        //newWeatherData = this.weatherGenerator.generate();

        // we only save if we have a new date/weather because the time will get refreshed when we load anyway
        this.currentWeather.date = currentDate;
        await this.moduleSettings.set(SettingKeys.lastWeatherData, this.currentWeather);    
      }
    } else {
      // always update because the time has likely changed even if the date didn't
      this.currentWeather.date = currentDate;
    }

    this.render();
  }

  // called from outside, to load the last weather from the settings
  public loadInitialWeather(): void {
    const weatherData = this.moduleSettings.get(SettingKeys.lastWeatherData);

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
      this.moduleSettings.set(SettingKeys.windowPosition, {top: element.offsetTop, left: element.offsetLeft});
      element.style.bottom = '';
    }
  }

  // access the current selections
  public getSeason(): Season | null {
    const element = document.getElementById('season-selection') as HTMLSelectElement | null;
    if (element)
      return Number(element.value) as Season;
    else 
      return null;
  }
  public getClimate(): Climate | null {
    const element = document.getElementById('climate-selection') as HTMLSelectElement | null;
    if (element)
      return Number(element.value) as Climate;
    else 
      return null;
  };
  public getHumidity(): Humidity | null {
    const element = document.getElementById('humidity-selection') as HTMLSelectElement | null;
    if (element)
      return Number(element.value) as Humidity;
    else 
      return null;
  };

  // listener activators
  private onWeatherToggleClick = (event): void => {
    event.preventDefault();

    // we store the state so it's remembered when we rerender, but we also just
    //    update the DOM for performance reasons (vs. forcing a re-render just for this)
    this.weatherPanelOpen = !this.weatherPanelOpen;

    const element = document.getElementById('sweath-container');
    if (element)
      element.classList.toggle('showWeather');
  } ;

  private onWeatherRegenerateClick = (event): void => {
    event.preventDefault();

    const humidity = this.getHumidity();
    const climate = this.getClimate();
    const season = this.getSeason();

    if (humidity!==null && climate!==null && season!==null) {
      this.currentWeather = generate(this.moduleSettings, climate, humidity, season, this.currentWeather);

      this.render();
    }
  };

  private onClimateSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    this.moduleSettings.set(SettingKeys.climate, Number(target.value));
  };

  private onHumiditySelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    this.moduleSettings.set(SettingKeys.humidity, Number(target.value));
  };

  private onBiomeSelectChange = (event): void => {
    const target = event.originalEvent?.target as HTMLSelectElement;

    // reset the climate and humidity selects
    const biomeMapping = biomeMappings[target.value];
    if (biomeMapping) {
      // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
      this.moduleSettings.set(SettingKeys.biome, target.value);

      // update the other selects
      const climate = document.getElementById('climate-selection') as HTMLSelectElement | null;
      if (climate)
        climate.value = String(biomeMapping.climate);
      
      const humidity = document.getElementById('humidity-selection') as HTMLSelectElement | null;
      if (humidity)
        humidity.value = String(biomeMapping.humidity);

    }
  };


  // place the window correctly and setup the drag handler for our dialog
  private initializeWindowInteractions($: JQuery<HTMLElement>) {
    // place the window based on last saved location
    const windowPosition = this.moduleSettings.get(SettingKeys.windowPosition);
    const weatherWindow = document.getElementById('sweath-container');

    if (!weatherWindow) return;

    log(false, 'Initializing position');

    weatherWindow.style.top = windowPosition.top + 'px';
    weatherWindow.style.left = windowPosition.left + 'px';

    // listen for drag events
    this.windowDragHandler = new WindowDrag();
    $.find('#sweath-window-move-handle').on('mousedown', () => {
      this.windowDragHandler.start(weatherWindow, (windowPos: WindowPosition) => {
        this.moduleSettings.set(SettingKeys.windowPosition, windowPos);
      });
    });
  }

  // private setClimate(html: JQuery) {
  //   const climateSelection = '#climate-selection';
  //   const climateName = this.weatherTracker.getWeatherData().climate?.name || Climates.temperate;
  //   html.find(climateSelection).val(climateName);
  // }

}
