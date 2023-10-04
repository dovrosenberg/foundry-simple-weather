import moduleJson from '@module';

import { log } from '../utils/log';
import { WeatherData } from '../models/weatherData';
import { WindowPosition } from '../models/windowPosition';
import { ModuleSettings } from '../settings/module-settings';
import { farenheitToCelsius } from '../utils/temperatureUtils';
import { WeatherTracker } from '../weather/weatherTracker';
import { WindowDrag } from './windowDrag';

export class WeatherApplication extends Application {
  private windowDragHandler: WindowDrag;

  constructor(
    private gameRef: Game,
    private settings: ModuleSettings,
    private weatherTracker: WeatherTracker,
    private renderCompleteCallback: () => void) {
    super();
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
      isGM: this.gameRef?.user?.isGM || false
    };
  }

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
    this.setClimate(html);
    this.listenToClimateChange(html);

    global[moduleJson.class] = {};
    global[moduleJson.class].resetPosition = () => this.resetPosition();
  }

  public updateWeather(weatherData: WeatherData) {
    this.assignElement('current-temperature', this.getTemperature(weatherData));
    this.assignElement('precipitation', weatherData.precipitation);
  }

  private assignElement(elementId: string, value: string) {
    const element = this.getElementById(elementId);
    if (element !== null)
      element.innerHTML  = value;
  }

  private getTemperature(weatherData: WeatherData): string {
    if (this.settings.getUseCelsius()) {
      return farenheitToCelsius(weatherData.temp) + ' °C';
    } else {
      return weatherData.temp + ' °F';
    }
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
    const element = this.getElementById('simple-weather-container');
    if (element) {
      log(false,'Resetting Window Position');
      element.style.top = defaultPosition.top + 'px';
      element.style.left = defaultPosition.left + 'px';
      this.settings.setWindowPosition({top: element.offsetTop, left: element.offsetLeft});
      element.style.bottom = null;
    }
  }

  // listener activators
  private listenToWindowExpand(html: JQuery) {
    const weather = '#weather-toggle';

    if (!this.gameRef?.user?.isGM && !this.settings.getPlayerSeeWeather()) {
      document.getElementById('weather-toggle').style.display = 'none';
    }

    html.find(weather).on('click', event => {
      event.preventDefault();
      if (this.gameRef?.user?.isGM || this.settings.getPlayerSeeWeather()) {
        document.getElementById('simple-weather-container').classList.toggle('showWeather');
      }
    });
  }

  private listenToWeatherRefreshClick(html: JQuery) {
    const refreshWeather = '#weather-regenerate';

    html.find(refreshWeather).on('click', event => {
      event.preventDefault();
      this.updateWeather(this.weatherTracker.generate());
    });
  }

  private listenToClimateChange(html: JQuery) {
    const climateSelection = '#climate-selection';

    html.find(climateSelection).on('change', (event) => {
      const target = event.originalEvent.target as HTMLSelectElement;
      const weatherData = this.weatherTracker.generate(target.value as Climates);
      this.updateWeather(weatherData);
    });
  }

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

    window.style.top = windowPosition.top + 'px';
    window.style.left = windowPosition.left + 'px';

    this.windowDragHandler = new WindowDrag();
    calendarMoveHandle.on('mousedown', () => {
      this.windowDragHandler.start(window, (windowPos: WindowPosition) => {
        this.settings.setWindowPosition(windowPos);
      });
    });
  }

  // utilities
  private getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  private setClimate(html: JQuery) {
    const climateSelection = '#climate-selection';
    const climateName = this.weatherTracker.getWeatherData().climate?.name || Climates.temperate;
    html.find(climateSelection).val(climateName);
  }

}
