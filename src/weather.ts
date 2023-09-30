import { WeatherApplication } from './applications/weatherApplication';
import { SimpleCalendarApi } from './libraries/simple-calendar/api';
import { SimpleCalendarPresenter } from './libraries/simple-calendar/simple-calendar-presenter';
import { Log } from './logger/logger';
import { CurrentDate, RawDate } from './models/currentDate';
import { Climates, WeatherData } from './models/weatherData';
import { ChatProxy } from './proxies/chatProxy';
import { ModuleSettings } from './settings/module-settings';
import { WeatherTracker } from './weather/weatherTracker';

/**
 * The base class of the module.
 * Every FoundryVTT features must be injected in this so we can mock them in tests.
 */
export class Weather {
  private weatherTracker: WeatherTracker;
  private weatherApplication: WeatherApplication;

  constructor(private gameRef: Game, private chatProxy: ChatProxy, private logger: Log, private settings: ModuleSettings) {
    this.weatherTracker = new WeatherTracker(this.gameRef, this.chatProxy, this.settings);
    this.logger.info('Init completed');
  }

  private isUserGM(): boolean {
    return this.gameRef.user.isGM;
  }

  public async onReady() {
    await this.initializeWeatherData();
    this.initializeWeatherApplication();
  }

  public onDateTimeChange(currentDate: CurrentDate) {
    let newWeatherData = this.mergePreviousDateTimeWithNewOne(currentDate);

    if (this.hasDateChanged(currentDate)) {
      this.logger.info('DateTime has changed');
      this.weatherTracker.setWeatherData(newWeatherData);

      if (this.isUserGM()) {
        this.logger.info('Generate new weather');
        newWeatherData = this.weatherTracker.generate();
      }
    }

    if (this.isUserGM()) {
      this.weatherTracker.setWeatherData(newWeatherData);
    }

    if (this.isWeatherApplicationAvailable()) {
      this.logger.debug('Update weather display');
      this.updateWeatherDisplay(currentDate);
    }
  }

  public onClockStartStop() {
    if (this.isWeatherApplicationAvailable()) {
      this.weatherApplication.updateClockStatus();
    }
  }

  public resetWindowPosition() {
    if (this.isWeatherApplicationAvailable()) {
      this.weatherApplication.resetPosition();
    }
  }

  private isWeatherApplicationAvailable(): boolean {
    return this.settings.getCalendarDisplay() || this.isUserGM();
  }

  private async initializeWeatherData() {
    let weatherData = this.settings.getWeatherData();

    if (this.isWeatherDataValid(weatherData)) {
      this.logger.info('Using saved weather data', weatherData);
      this.weatherTracker.setWeatherData(weatherData);
    } else if (this.isUserGM()) {
      this.logger.info('No saved weather data - Generating weather');

      weatherData.currentDate = SimpleCalendarPresenter.timestampToDate(SimpleCalendarApi.timestamp());
      this.weatherTracker.setWeatherData(weatherData);
      weatherData = this.weatherTracker.generate(Climates.temperate);
      await this.settings.setWeatherData(weatherData);
    }
  }

  private initializeWeatherApplication() {
    if (this.isWeatherApplicationAvailable()) {
      this.weatherApplication = new WeatherApplication(
        this.gameRef,
        this.settings,
        this.weatherTracker,
        this.logger,
        () => {
          const weatherData = this.settings.getWeatherData();
          this.weatherApplication.updateDateTime(weatherData.currentDate);
          this.weatherApplication.updateWeather(weatherData);
        });
    }
  }

  private mergePreviousDateTimeWithNewOne(currentDate: CurrentDate): WeatherData {
    return Object.assign({}, this.weatherTracker.getWeatherData(), {currentDate});
  }

  private hasDateChanged(currentDate: CurrentDate): boolean {
    const previous = this.weatherTracker.getWeatherData().currentDate?.raw;
    const date = currentDate.raw;

    if (this.isDateTimeValid(currentDate.raw)) {
      if (date.day !== previous.day
        || date.month !== previous.month
        || date.year !== previous.year) {
        return true;
      }
    }

    return false;
  }

  private isDateTimeValid(rawDate: RawDate): boolean {
    if (this.isDefined(rawDate.second) && this.isDefined(rawDate.minute) && this.isDefined(rawDate.day) &&
    this.isDefined(rawDate.month) && this.isDefined(rawDate.year)) {
      return true;
    }

    return false;
  }

  private isDefined(value: unknown) {
    return value !== undefined && value !== null;
  }

  private isWeatherDataValid(weatherData: WeatherData): boolean {
    return !!weatherData.temp;
  }

  private updateWeatherDisplay(dateTime: CurrentDate) {
    this.weatherApplication.updateDateTime(dateTime);
    this.weatherApplication.updateWeather(this.weatherTracker.getWeatherData());
  }
}
