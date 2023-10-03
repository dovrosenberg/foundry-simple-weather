import { WeatherApplication } from './applications/weatherApplication';
import { Climates } from './models/weatherData';
import { WeatherTracker } from './weather/weatherTracker';
/**
 * The base class of the module.
 * Every FoundryVTT features must be injected in this so we can mock them in tests.
 */
export class Weather {
    constructor(gameRef, chatProxy, logger, settings) {
        this.gameRef = gameRef;
        this.chatProxy = chatProxy;
        this.logger = logger;
        this.settings = settings;
        this.weatherTracker = new WeatherTracker(this.gameRef, this.chatProxy, this.settings);
        this.logger.info('Init completed');
    }
    isUserGM() {
        var _a, _b;
        return ((_b = (_a = this.gameRef) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.isGM) || false;
    }
    async onReady() {
        await this.initializeWeatherData();
        this.initializeWeatherApplication();
    }
    onDateTimeChange(currentDate) {
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
    resetWindowPosition() {
        if (this.isWeatherApplicationAvailable()) {
            this.weatherApplication.resetPosition();
        }
    }
    isWeatherApplicationAvailable() {
        return this.settings.getCalendarDisplay() || this.isUserGM();
    }
    async initializeWeatherData() {
        let weatherData = this.settings.getWeatherData();
        if (this.isWeatherDataValid(weatherData)) {
            this.logger.info('Using saved weather data', weatherData);
            this.weatherTracker.setWeatherData(weatherData);
        }
        else if (this.isUserGM()) {
            this.logger.info('No saved weather data - Generating weather');
            // NOTE: This is where you'll need to start mid-season, for example
            // more generally... if we saved the prior day, we should generate weather based on that day 
            // otherwise, we should generate weather starting at a random spot based on the season
            weatherData.currentDate = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
            this.weatherTracker.setWeatherData(weatherData);
            weatherData = this.weatherTracker.generate(Climates.temperate);
            await this.settings.setWeatherData(weatherData);
        }
    }
    initializeWeatherApplication() {
        if (this.isWeatherApplicationAvailable()) {
            this.weatherApplication = new WeatherApplication(this.gameRef, this.settings, this.weatherTracker, this.logger, () => {
                const weatherData = this.settings.getWeatherData();
                weatherData.currentDate = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
                this.weatherApplication.updateDateTime(weatherData.currentDate);
                this.weatherApplication.updateWeather(weatherData);
            });
        }
    }
    mergePreviousDateTimeWithNewOne(currentDate) {
        return Object.assign({}, this.weatherTracker.getWeatherData(), { currentDate });
    }
    hasDateChanged(currentDate) {
        const previous = this.weatherTracker.getWeatherData().currentDate;
        if (this.isDateTimeValid(currentDate)) {
            if (currentDate.day !== previous.day
                || currentDate.month !== previous.month
                || currentDate.year !== previous.year) {
                return true;
            }
        }
        return false;
    }
    isDateTimeValid(date) {
        if (this.isDefined(date.second) && this.isDefined(date.minute) && this.isDefined(date.day) &&
            this.isDefined(date.month) && this.isDefined(date.year)) {
            return true;
        }
        return false;
    }
    isDefined(value) {
        return value !== undefined && value !== null;
    }
    isWeatherDataValid(weatherData) {
        return !!weatherData.temp;
    }
    updateWeatherDisplay(dateTime) {
        this.weatherApplication.updateDateTime(dateTime);
        this.weatherApplication.updateWeather(this.weatherTracker.getWeatherData());
    }
}
//# sourceMappingURL=weather.js.map