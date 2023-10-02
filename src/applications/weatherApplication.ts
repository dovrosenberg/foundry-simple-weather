import moduleJson from '@module';

import { Log } from '../logger/logger';
import { Climates, WeatherData } from '../models/weatherData';
import { WindowPosition } from '../models/windowPosition';
import { ModuleSettings } from '../settings/module-settings';
import { farenheitToCelsius } from '../utils/temperatureUtils';
import { WeatherTracker } from '../weather/weatherTracker';
import { WindowDrag } from './windowDrag';
//import { SimpleCalendar } from 'foundryvtt-simple-calendar';

export class WeatherApplication extends Application {
  private windowDragHandler: WindowDrag;

  constructor(
    private gameRef: Game,
    private settings: ModuleSettings,
    private weatherTracker: WeatherTracker,
    private logger: Log,
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
      isGM: this.isTimeManipulationEnabled(),
    };
  }

  public activateListeners(html: JQuery) {
    this.renderCompleteCallback();

    const dateFormatToggle = '#date-display';
    const startStopClock = '#start-stop-clock';

    this.initializeWindowInteractions(html);

    html.find(dateFormatToggle).on('mousedown', event => {
      this.toggleDateFormat(event);
    });

    html.find(startStopClock).on('mousedown', event => {
      this.startStopClock(event);
    });

    this.listenToWindowExpand(html);
    this.listenToWeatherRefreshClick(html);
    this.setClimate(html);
    this.listenToClimateChange(html);

    if (this.isTimeManipulationEnabled()) {
      this.listenToTimeSkipButtons(html);
    }

    global[moduleJson.class] = {};
    global[moduleJson.class].resetPosition = () => this.resetPosition();
  }

  public updateWeather(weatherData: WeatherData) {
    this.getElementById('current-temperature').innerHTML = this.getTemperature(weatherData);
    this.getElementById('precipitation').innerHTML = weatherData.precipitation;
  }

  private getTemperature(weatherData: WeatherData): string {
    if (this.settings.getUseCelsius()) {
      return farenheitToCelsius(weatherData.temp) + ' °C';
    } else {
      return weatherData.temp + ' °F';
    }
  }

  public updateClockStatus() {
    if (this.isTimeManipulationEnabled()) {
      if (SimpleCalendar.api.clockStatus().started) {
        this.getElementById('btn-advance_01').classList.add('disabled');
        this.getElementById('btn-advance_02').classList.add('disabled');
        this.getElementById('time-running').classList.add('isRunning');
        this.getElementById('clock-run-indicator').classList.add('isRunning');
      } else {
        this.getElementById('btn-advance_01').classList.remove('disabled');
        this.getElementById('btn-advance_02').classList.remove('disabled');
        this.getElementById('time-running').classList.remove('isRunning');
        this.getElementById('clock-run-indicator').classList.remove('isRunning');
      }
    }
  }

  public updateDateTime(currentDate: SimpleCalendar.DateData) {
    if (currentDate) {
      console.log(currentDate);
      document.getElementById('weekday').innerHTML = currentDate.weekdays[currentDate.dayOfTheWeek];

      document.getElementById('date').innerHTML = currentDate.display.date;
      document.getElementById('date-num').innerHTML = currentDate.day + '/' + currentDate.month + '/' + currentDate.year;
      document.getElementById('calendar-time').innerHTML = currentDate.display.time;

      this.updateClockStatus();
    }
  }

  public resetPosition() {
    const defaultPosition = { top: 100, left: 100 };
    const element = this.getElementById('simple-weather-container');
    if (element) {
      this.logger.info('Resetting Window Position');
      element.style.top = defaultPosition.top + 'px';
      element.style.left = defaultPosition.left + 'px';
      this.settings.setWindowPosition({top: element.offsetTop, left: element.offsetLeft});
      element.style.bottom = null;
    }
  }

  private listenToWindowExpand(html: JQuery) {
    const weather = '#weather-toggle';

    if (!this.gameRef.user.isGM && !this.settings.getPlayerSeeWeather()) {
      document.getElementById('weather-toggle').style.display = 'none';
    }

    html.find(weather).on('click', event => {
      event.preventDefault();
      if (this.gameRef.user.isGM || this.settings.getPlayerSeeWeather()) {
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

  private setClimate(html: JQuery) {
    const climateSelection = '#climate-selection';
    const climateName = this.weatherTracker.getWeatherData().climate?.name || Climates.temperate;
    html.find(climateSelection).val(climateName);
  }

  private listenToClimateChange(html: JQuery) {
    const climateSelection = '#climate-selection';

    html.find(climateSelection).on('change', (event) => {
      const target = event.originalEvent.target as HTMLSelectElement;
      const weatherData = this.weatherTracker.generate(target.value as Climates);
      this.updateWeather(weatherData);
    });
  }

  private getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  private toggleDateFormat(event) {
    event.currentTarget.classList.toggle('altFormat');
  }

  private startStopClock(event) {
    event.preventDefault();
    event = event || window.event;

    if (SimpleCalendar.api.isPrimaryGM()) {
      if (SimpleCalendar.api.clockStatus().started) {
        this.logger.debug('Stopping clock');
        SimpleCalendar.api.stopClock();
      } else {
        this.logger.debug('Starting clock');
        SimpleCalendar.api.startClock();
      }
    }

    this.updateClockStatus();
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

  private listenToTimeSkipButtons(html: JQuery) {
    const advanceButtons = html.find('.advance-btn');
    advanceButtons.on('click', button => {
      const increment = button.target.getAttribute('data-increment');
      const unit = button.target.getAttribute('data-unit');

      SimpleCalendar.api.changeDate({ [unit]: Number(increment) });
    });
  }

  private isTimeManipulationEnabled(): boolean {
    return this.gameRef.user.isGM;
  }
}
