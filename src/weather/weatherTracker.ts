import { Climate } from '../models/climate';
import { Climates, WeatherData } from '../models/weatherData';
import { ChatProxy } from '../proxies/chatProxy';
import { ModuleSettings } from '../settings/module-settings';
import { farenheitToCelsius } from '../utils/temperatureUtils';
import { PrecipitationsGenerator } from './precipitationsGenerator';

/**
 * Manages all things related to  weather
 */
export class WeatherTracker {
  private weatherData: WeatherData;
  private precipitations: PrecipitationsGenerator;

  constructor(private gameRef: Game, private chatProxy: ChatProxy, private settings: ModuleSettings) {
    this.precipitations = new PrecipitationsGenerator(this.gameRef);
  }

  public getWeatherData(): WeatherData {
    return this.weatherData;
  }

  public setWeatherData(weatherData: WeatherData) {
    this.weatherData = weatherData;
    this.settings.setWeatherData(weatherData);
  }

  public generate(newClimate?: Climates): WeatherData {
    if (!this.weatherData.climate) {
      this.weatherData.climate = this.getClimateData(Climates.temperate);
    }

    this.setTemperatureRange();

    if (newClimate) { // If climate has been changed
      this.weatherData.climate = this.getClimateData(newClimate);
      this.weatherData.temp =
        this.randAroundValue(this.weatherData.lastTemp || this.rand(0, 20), 5) // Generate a new temperature from the previous, with a variance of 5
        + this.weatherData.climate.baseTemperature // Add the climate offset
        + (this.rand(1, 20) === 20 ? 20 : 0); // On a nat 20, add 20 F to cause extreme temperature
    } else if (this.rand(1, 3) === 3) { // In one against 3 cases
      this.weatherData.temp = this.rand(40, 70) + this.weatherData.climate.baseTemperature; // Generate a temperature between cold and room temp
    } else {
      this.weatherData.temp =
        this.randAroundValue(this.weatherData.lastTemp, 5) // Generate a new temperature from the previous, with a variance of 5
        + Math.floor(this.weatherData.climate.baseTemperature / 20); // Add the biggest offset between climate and  season. Will usually be 1, otherwise 2, maximum of 5
    }

    if (this.weatherData.lastTemp > this.weatherData.tempRange.max) { // If current temperature is higher than the max
      // Increase the temperature by between 5 ⁰F and 10 ⁰F
      this.weatherData.temp = this.rand(this.weatherData.lastTemp - 10, this.weatherData.lastTemp - 5);
    } else if (this.weatherData.lastTemp < this.weatherData.tempRange.min) { // If current temperature is lower than minimum
      // Decrease the temperature by between 5 ⁰F and 10 ⁰F
      this.weatherData.temp = this.rand(this.weatherData.lastTemp + 5, this.weatherData.lastTemp + 10);
    }

    // Save the last temperature
    this.weatherData.lastTemp = this.weatherData.temp;

    this.weatherData.precipitation = this.precipitations.generate(this.rand(1, 20), this.weatherData);

    // Output to chat if enabled
    if (this.settings.getOutputWeatherToChat()) {
      this.output();
    }

    this.setWeatherData(this.weatherData);
    return this.weatherData;
  }

  private setTemperatureRange() {
    if (this.weatherData.tempRange === undefined) {
      this.weatherData.tempRange = {
        max: 90,
        min: -20
      };
    }
  }

  private getTemperature(): string {
    if (this.settings.getUseCelsius()) {
      return farenheitToCelsius(this.weatherData.temp) + ' °C';
    } else {
      return this.weatherData.temp + ' °F';
    }
  }

  private output() {
    let messageRecipients = '';

    if (!this.settings.getOutputWeatherToChat()) {
      messageRecipients = this.chatProxy.getWhisperRecipients('GM')[0].id || '';

      if (messageRecipients) {
        const chatOut = '<b>' + this.getTemperature() + '</b> - ' + this.weatherData.precipitation;

        this.chatProxy.create({
          speaker: {
            alias: this.gameRef.i18n.localize('sweath.weather.tracker.Today'),
          },
          whisper: [messageRecipients],
          content: chatOut,
        });
      }
    }
  }

  /**
  * Generate a random number between to boundaries
  * @param min
  * @param max
  * @returns Random number
  */
  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Generate a random number around a middle value. The resulting value will no have a difference bigger than specified.
   * @param middleValue Value used as middle value
   * @param maxDifference Maximum difference from the middle value
   * @returns
   */
  private randAroundValue(middleValue: number, maxDifference: number) {
    return this.rand(middleValue - maxDifference, middleValue + maxDifference);
  }

  private getClimateData(climateName: Climates): Climate {
    const climate = new Climate();
    climate.isVolcanic = false;
    climate.name = climateName;

    switch (climateName) {
    case Climates.temperate:
      climate.humidity = 0;
      climate.baseTemperature = 0;
      climate.temperatureRange = {
        max: 100,
        min: -5
      };
      break;
    case Climates.temperateMountain:
      climate.humidity = 0;
      climate.baseTemperature = -10;
      climate.temperatureRange = {
        max: 75,
        min: -40
      };
      break;
    case Climates.desert:
      climate.humidity = -4;
      climate.baseTemperature = 20;
      climate.temperatureRange = {
        max: 134,
        min: 50
      };
      break;
    case Climates.tundra:
      climate.humidity = 0;
      climate.baseTemperature = -20;
      climate.temperatureRange = {
        max: 30,
        min: -60
      };
      break;
    case Climates.tropical:
      climate.humidity = 1;
      climate.baseTemperature = 20;
      climate.temperatureRange = {
        max: 100,
        min: 60
      };
      break;
    case Climates.taiga:
      climate.humidity = -1;
      climate.baseTemperature = -20;
      climate.temperatureRange = {
        max: 70,
        min: -65
      };
      break;
    case Climates.volcanic:
      climate.humidity = 0;
      climate.baseTemperature = 40;
      climate.isVolcanic = true;
      climate.temperatureRange = {
        max: 170,
        min: 70
      };
      break;
    case Climates.polar:
      climate.humidity = 0;
      climate.baseTemperature = -50;
      climate.temperatureRange = {
        max: 10,
        min: -170
      };
      break;
    }

    return climate;
  }
}
