import moduleJson from '@module';

import { log } from '@/utils/log';
import { WeatherData } from '@/weather/WeatherData';
import { seasonSelections, biomeSelections, Climate, climateSelections, Humidity, humiditySelections, Season, biomeMappings } from '@/weather/climateData';
import { WindowPosition } from '@/window/WindowPosition';
import { SettingKeys } from '@/settings/moduleSettings';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';
import { generate } from '@/weather/weatherGenerator';
import { moduleSettings } from '@/settings/moduleSettings';

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
  private windowPosition: WindowPosition;
  private calendarPresent = false;   // is simple calendar present?
  
  constructor() {
    super();

    this.weatherPanelOpen = false;

    log(false, 'WeatherApplication construction');

    // get default position or set default
    this.setWindowPosition(
      moduleSettings.get(SettingKeys.windowPosition) || {
        left: 100,
        top: 100,
      }
    );

    this.setWeather();  

    // initial render -- needed even though setWeather will render because we need to force
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
      biomeSelections: biomeSelections,
      seasonSelections: seasonSelections,
      humiditySelections: humiditySelections,
      climateSelections: climateSelections,
      hideDialog: (isClientGM() || moduleSettings.get(SettingKeys.dialogDisplay)) ? false : true,
      hideCalendar: !this.calendarPresent,
      hideWeather: this.calendarPresent && !this.weatherPanelOpen,  // note: without the calendar, we always show the weather box
      windowPosition: this.windowPosition,
    };

    return data;
  }

  // move the window
  // we can't use foundry's setPosition() because it doesn't work for fixed size, non popout windows
  public setWindowPosition(newPosition: WindowPosition) {
    this.windowPosition = newPosition;

    // save
    moduleSettings.set(SettingKeys.windowPosition, {top: newPosition.top, left: newPosition.left});

    this.render();
  }

  public activateCalendar(): void {
    this.calendarPresent = true;
    this.render();
  }

  // called by the parent class to attach event handlers after window is rendered
  // note that saved weather has been reloaded by the time this is called when we're initializing
  // this is called on every render!  One-time functionality should be put in ????? 
  public async activateListeners(html: JQuery<HTMLElement>) {
    // handle window drag
    html.find('#sweath-calendar-move-handle').on('mousedown', this.onMoveHandleMouseDown);
    html.find('#sweath-weather-move-handle').on('mousedown', this.onMoveHandleMouseDown);

    // setup handlers and values for everyone
    html.find('#weather-toggle').on('click', this.onWeatherToggleClick);

    // GM-only
    if (isClientGM()) {
      // set the drop-down values
      html.find('#climate-selection').val(moduleSettings.get(SettingKeys.climate));
      html.find('#humidity-selection').val(moduleSettings.get(SettingKeys.humidity));
      html.find('#season-selection').val(moduleSettings.get(SettingKeys.season));
      html.find('#biome-selection').val(moduleSettings.get(SettingKeys.biome));

      html.find('#sweath-weather-refresh').on('click', this.onWeatherRegenerateClick);
      html.find('#biome-selection').on('change', this.onBiomeSelectChange);
      html.find('#climate-selection').on('change', this.onClimateSelectChange);
      html.find('#humidity-selection').on('change', this.onHumiditySelectChange);
      html.find('#season-selection').on('change', this.onSeasonSelectChange);
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
      this.currentWeather.date = currentDate;
    }

    this.render();
  }

  // called from outside, to load the last weather from the settings
  // also called by player clients when GM updates the settings
  public setWeather(): void {
    const weatherData = moduleSettings.get(SettingKeys.lastWeatherData);

    if (weatherData) {
      log(false, 'Using saved weather data');

      this.currentWeather = weatherData;
    } else if (isClientGM()) {
      log(false, 'No saved weather data - Generating weather');

      this.generateWeather(null);
    }

    this.render();
  }

  // generate weather based on drop-down settings, store locally and update db
  private generateWeather(currentDate: SimpleCalendar.DateData | null): void {
    const climate = this.getClimate();
    const humidity = this.getHumidity();
    const season = this.getSeason();

    this.currentWeather = generate(
      climate!==null ? climate : Climate.Cold, 
      humidity!==null ? humidity : Humidity.Modest, 
      season!==null ? season : Season.Spring, 
      currentDate,
      this.currentWeather || null
    );

    moduleSettings.set(SettingKeys.lastWeatherData, this.currentWeather);        
  }

  // has the date part changed
  private hasDateChanged(currentDate: SimpleCalendar.DateData): boolean {
    const previous = this.currentWeather?.date;

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

    this.weatherPanelOpen = !this.weatherPanelOpen;
    this.render();
  } ;

  private onWeatherRegenerateClick = (event): void => {
    event.preventDefault();

    this.generateWeather(this.currentWeather?.date || null);
    moduleSettings.set(SettingKeys.lastWeatherData, this.currentWeather);        

    this.render();
  };

  private onSeasonSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    moduleSettings.set(SettingKeys.season, Number(target.value));
  };

  private onClimateSelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    moduleSettings.set(SettingKeys.climate, Number(target.value));

    // set biome to blank because we adjusted manually
    jQuery(document).find('#biome-selection').val('');
    moduleSettings.set(SettingKeys.biome, '');
  };

  private onHumiditySelectChange = (event): void => {
    // save the value - we don't regenerate because we might be changing other settings, too, and don't want to trigger a bunch of chat messages
    const target = event.originalEvent?.target as HTMLSelectElement;
    moduleSettings.set(SettingKeys.humidity, Number(target.value));

    // set biome to blank because we adjusted manually
    jQuery(document).find('#biome-selection').val('');
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
      moduleSettings.set(SettingKeys.biome, target.value);

      // update the other selects
      const climate = document.getElementById('climate-selection') as HTMLSelectElement | null;
      if (climate) {
        climate.value = String(biomeMapping.climate);
        moduleSettings.set(SettingKeys.climate, biomeMapping.climate);
      }
      
      const humidity = document.getElementById('humidity-selection') as HTMLSelectElement | null;
      if (humidity) {
        humidity.value = String(biomeMapping.humidity);
        moduleSettings.set(SettingKeys.humidity, biomeMapping.humidity);
      }
    }
  };

  private onMoveHandleMouseDown = (): void => {
    const element = document.getElementById(this.windowID);
    if (element) {
      this.windowDragHandler.start(element, (position: WindowPosition) => {
        // save the new location
        this.setWindowPosition(position);
      });
    }
  };  
}
