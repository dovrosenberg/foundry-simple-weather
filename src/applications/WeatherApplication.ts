import moduleJson from '@module';

import { log } from '@/utils/log';
import { Humidity, Climate, Season, WeatherData } from '@/weather/WeatherData';
import { WindowPosition } from '@/window/WindowPosition';
import { ModuleSettings } from '@/settings/module-settings';
import { WeatherGenerator } from '@/weather/weatherGenerator';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';

export class WeatherApplication extends Application {
  private windowDragHandler: WindowDrag;
  private settings: ModuleSettings;
  private weatherGenerator: WeatherGenerator;
  private renderCompleteCallback: () => void;

  // renderCompleteCallback will be called when listeners are activated, so can contain
  //    any logic that needs to be activated at that point
  constructor(settings: ModuleSettings, weatherGenerator: WeatherGenerator, renderCompleteCallback: () => void) {
    super();

    this.settings = settings;
    this.weatherGenerator = weatherGenerator;
    this.renderCompleteCallback = renderCompleteCallback;

    log(false, 'WeatherApplication construction');
    this.render(true);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/calendar.html`;
    options.popOut = false;
    options.resizable = false;

    return options;
  }

  public getData(): any {
    return {
      isGM: isClientGM()
    };
  }

  // called by the parent class to attach event handlers
  public activateListeners(html: JQuery) {
    this.renderCompleteCallback();
    const dateFormatToggle = '#date-display';
    const startStopClock = '#start-stop-clock';

    this.initializeWindowInteractions(html);

    html.find(dateFormatToggle).on('mousedown', event => {
      this.onMouseDownToggleDateFormat(event);
    });

    html.find(startStopClock).on('mousedown', event => {
      this.onMouseDownStartStopClock(event);
    });

    this.listenToWindowExpand(html);
    this.listenToWeatherRefreshClick(html);
    //this.setClimate(html);
    //this.listenToClimateChange(html);

    global[moduleJson.class] = {};
    global[moduleJson.class].resetPosition = () => this.resetPosition();
  }

  public updateWeather(weatherData: WeatherData) {
    this.assignElement('current-temperature', weatherData.getTemperature(this.settings.getUseCelsius()));
    this.assignElement('current-description', weatherData.getDescription());
  }

  private assignElement(elementId: string, value: string) {
    const element = document.getElementById(elementId);
    if (element !== null)
      element.innerHTML  = value;
  }

  // updates the current date/time showing in the weather dialog
  public updateDateTime(currentDate: SimpleCalendar.DateData) {
    if (currentDate) {
      this.assignElement('weekday', currentDate.weekdays[currentDate.dayOfTheWeek]);

      this.assignElement('date', currentDate.display.date);
      this.assignElement('date-num', currentDate.day + '/' + currentDate.month + '/' + currentDate.year);
      this.assignElement('calendar-time', currentDate.display.time);
    }
  }

  public resetPosition() {
    const defaultPosition = { top: 100, left: 100 };
    const element = document.getElementById('simple-weather-container');
    if (element) {
      log(false,'Resetting Window Position');
      element.style.top = defaultPosition.top + 'px';
      element.style.left = defaultPosition.left + 'px';
      this.settings.setWindowPosition({top: element.offsetTop, left: element.offsetLeft});
      element.style.bottom = '';
    }
  }

  // listener activators
  private listenToWindowExpand(html: JQuery) {
    // hide the toggle for non-GM clients
    if (!isClientGM()) {
      const element = document.getElementById('weather-toggle');
      if (element)
        element.style.display = 'none';
    } else {
      // set the handler
      html.find('#weather-toggle').on('click', event => {
        event.preventDefault();

        const element = document.getElementById('simple-weather-container');
        if (element)
          element.classList.toggle('showWeather');
      });
    }
  }

  private listenToWeatherRefreshClick(html: JQuery) {
    // add the handler
    if (isClientGM()) {
      html.find('#weather-regenerate').on('click', event => {
        event.preventDefault();
        this.updateWeather(this.weatherGenerator.generate(Climate.Cold, Humidity.Barren, Season.Winter, null));
      });
    } 
  }

  // private listenToClimateChange(html: JQuery) {
  //   const climateSelection = '#climate-selection';

  //   html.find(climateSelection).on('change', (event) => {
  //     const target = event.originalEvent?.target as HTMLSelectElement;
  //     const weatherData = this.weatherGenerator.generate(target?.value as Climates);
  //     this.updateWeather(weatherData);
  //   });
  // }

  // event handlers
  private onMouseDownToggleDateFormat(event) {
    event.currentTarget.classList.toggle('altFormat');
  }

  private onMouseDownStartStopClock(event) {
    event.preventDefault();
    event = event || window.event;

    if (SimpleCalendar.api.isPrimaryGM()) {
      if (SimpleCalendar.api.clockStatus().started) {
        log(false,'Stopping clock');
        SimpleCalendar.api.stopClock();
      } else {
        log(false,'Starting clock');
        SimpleCalendar.api.startClock();
      }
    }
  }

  private initializeWindowInteractions(html: JQuery) {
    const calendarMoveHandle = html.find('#window-move-handle');
    const window = calendarMoveHandle.parents('#simple-weather-container').get(0);
    const windowPosition = this.settings.getWindowPosition();

    if (!window) return;

    window.style.top = windowPosition.top + 'px';
    window.style.left = windowPosition.left + 'px';

    this.windowDragHandler = new WindowDrag();
    calendarMoveHandle.on('mousedown', () => {
      this.windowDragHandler.start(window, (windowPos: WindowPosition) => {
        this.settings.setWindowPosition(windowPos);
      });
    });
  }

  // private setClimate(html: JQuery) {
  //   const climateSelection = '#climate-selection';
  //   const climateName = this.weatherTracker.getWeatherData().climate?.name || Climates.temperate;
  //   html.find(climateSelection).val(climateName);
  // }

}
