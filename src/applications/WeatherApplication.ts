import moduleJson from '@module';

import { log } from '@/utils/log';
import { WeatherData } from '@/weather/WeatherData';
import { seasonSelections, biomeSelections, Climate, climateSelections, Humidity, humiditySelections, Season, biomeMappings } from '@/weather/climateData';
import { WindowPosition } from '@/window/WindowPosition';
import { SettingKeys } from '@/settings/module-settings';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';
import { generate } from '@/weather/weatherGenerator';
import { moduleSettings } from '@/settings/module-settings';

// the solo instance
export let weatherApplication: WeatherApplication;

// set the main application; should only be called once
export function updateWeatherApplication(weatherApp: WeatherApplication): void {
  weatherApplication = weatherApp;
}

export class WeatherApplication extends Application {
  private currentWeather: WeatherData;
  private weatherPanelOpen: boolean;
  private windowID = 'sweath-container';
  private windowDragHandler = new WindowDrag();

  constructor() {
    super();

    this.weatherPanelOpen = false;

    log(false, 'WeatherApplication construction');

    this.loadInitialWeather();

    // initial render
    this.render(true);
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
      displayDate: this.currentWeather?.date?.display ? this.currentWeather.date.display.date : '',
      formattedDate: this.currentWeather?.date ? this.currentWeather.date.day + '/' + this.currentWeather.date.month + '/' + this.currentWeather.date.year : '',
      formattedTime: this.currentWeather?.date?.display ? this.currentWeather.date.display.time : '',
      weekday: this.currentWeather?.date ? this.currentWeather.date.weekdays[this.currentWeather.date.dayOfTheWeek] : '',
      currentTemperature: this.currentWeather ? this.currentWeather.getTemperature(moduleSettings.get(SettingKeys.useCelsius)) : '',
      currentDescription: this.currentWeather ? this.currentWeather.getDescription() : '',
      weatherPanelOpen: this.weatherPanelOpen,
      biomeSelections: biomeSelections,
      seasonSelections: seasonSelections,
      humiditySelections: humiditySelections,
      climateSelections: climateSelections,
      hideWeather: isClientGM() || moduleSettings.get(SettingKeys.dialogDisplay) ? false : true,
    };

    //console.log(JSON.stringify(biomeSelections));
    return data;
  }

  // called by the parent class to attach event handlers after window is rendered
  // note that saved weather has been reloaded by the time this is called when we're initializing
  // this is called on every render!  One-time functionality should be put in ????? 
  public async activateListeners(html: JQuery<HTMLElement>) {
    // toggle date format when the date is clicked
    html.find('#date-display').on('mousedown', event => {
      event.currentTarget.classList.toggle('altFormat');
    });

    // //this.setClimate(html);

    // // expose a SimpleWeather global object to enable calling resetPosition
    // global.SimpleWeather = {};
    // global.SimpleWeather.resetPosition = () => this.resetPosition();

    // handle window drag
    html.find('#sweath-window-move-handle').on('mousedown', this.onMoveHandleMouseDown);
    
    // set the drop-down values
    html.find('#climate-selection').val(moduleSettings.get(SettingKeys.climate));
    html.find('#humidity-selection').val(moduleSettings.get(SettingKeys.humidity));
    html.find('#season-selection').val(moduleSettings.get(SettingKeys.season));
    html.find('#biome-selection').val(moduleSettings.get(SettingKeys.biome));


    // add the handlers
    if (isClientGM()) {
      html.find('#sweath-weather-regenerate').on('click', this.onWeatherRegenerateClick);
      html.find('#weather-toggle').on('click', this.onWeatherToggleClick);
      html.find('#biome-selection').on('change', this.onBiomeSelectChange);
      html.find('#climate-selection').on('change', this.onClimateSelectChange);
      html.find('#humidity-selection').on('change', this.onHumiditySelectChange);
    } else {
      // // hide stuff
      // const element = document.getElementById('weather-toggle');
      // if (element)
      //   element.style.display = 'none';
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
        await moduleSettings.set(SettingKeys.lastWeatherData, this.currentWeather);    
      }
    } else {
      // always update because the time has likely changed even if the date didn't
      this.currentWeather.date = currentDate;
    }

    this.render();
  }

  // called from outside, to load the last weather from the settings
  public loadInitialWeather(): void {
    const weatherData = moduleSettings.get(SettingKeys.lastWeatherData);

    log(false, 'loaded weatherData:' + JSON.stringify(weatherData));

    if (weatherData) {
      log(false, 'Using saved weather data');

      this.currentWeather = weatherData;
    } else if (isClientGM()) {
      log(false, 'No saved weather data - Generating weather');
  
      this.currentWeather = generate(moduleSettings, Climate.Cold, Humidity.Modest, Season.Spring, null);
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
        
    const element = document.getElementById(this.windowID);
    if (element) {
      log(false,'Resetting Window Position');
      element.style.top = defaultPosition.top + 'px';
      element.style.left = defaultPosition.left + 'px';
      moduleSettings.set(SettingKeys.windowPosition, {top: element.offsetTop, left: element.offsetLeft});
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
  }
  public getHumidity(): Humidity | null {
    const element = document.getElementById('humidity-selection') as HTMLSelectElement | null;
    if (element)
      return Number(element.value) as Humidity;
    else 
      return null;
  }

  // listener activators
  private onWeatherToggleClick = (event): void => {
    event.preventDefault();

    // we store the state so it's remembered when we rerender, but we also just
    //    update the DOM for performance reasons (vs. forcing a re-render just for this)
    this.weatherPanelOpen = !this.weatherPanelOpen;

    const element = document.getElementById(this.windowID);
    if (element)
      element.classList.toggle('showWeather');
  } ;

  private onWeatherRegenerateClick = (event): void => {
    event.preventDefault();

    const humidity = this.getHumidity();
    const climate = this.getClimate();
    const season = this.getSeason();

    if (humidity!==null && climate!==null && season!==null) {
      this.currentWeather = generate(moduleSettings, climate, humidity, season, this.currentWeather);

      this.render();
    }
  };

  private onClimateSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    moduleSettings.set(SettingKeys.climate, Number(target.value));
  };

  private onHumiditySelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    moduleSettings.set(SettingKeys.humidity, Number(target.value));
  };

  private onBiomeSelectChange = (event): void => {
    const target = event.originalEvent?.target as HTMLSelectElement;

    // reset the climate and humidity selects
    const biomeMapping = biomeMappings[target.value];
    if (biomeMapping) {
      // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
      moduleSettings.set(SettingKeys.biome, target.value);

      // update the other selects
      const climate = document.getElementById('climate-selection') as HTMLSelectElement | null;
      if (climate)
        climate.value = String(biomeMapping.climate);
      
      const humidity = document.getElementById('humidity-selection') as HTMLSelectElement | null;
      if (humidity)
        humidity.value = String(biomeMapping.humidity);

    }
  };

  private onMoveHandleMouseDown = (): void => {
    const element = document.getElementById(this.windowID);
    if (element) {
      this.windowDragHandler.start(element, (windowPos: WindowPosition) => {
        // save the new location
        moduleSettings.set(SettingKeys.windowPosition, windowPos);
      });
    }
  };  

  // place the window correctly and setup the drag handler for our dialog
  // should be called before rendering
  public async initialize(): Promise<void> {
    // place the window based on last saved location
    const element = document.getElementById(this.windowID);
    const windowPosition = moduleSettings.get(SettingKeys.windowPosition);

    if (element && windowPosition) {
      log(false, 'Initializing position');

      element.style.top = windowPosition.top + 'px';
      element.style.left = windowPosition.left + 'px';
    }
  }
}
