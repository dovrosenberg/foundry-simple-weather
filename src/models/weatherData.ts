import { Climate } from './climate';
import { CurrentDate } from './currentDate';

export enum Climates {
  temperate = 'temperate',
  temperateMountain = 'temperateMountain',
  desert = 'desert',
  tundra = 'tundra',
  tropical = 'tropical',
  taiga = 'taiga',
  volcanic = 'volcanic',
  polar = 'polar',
}

export class WeatherData {
  public version = 1;

  public currentDate: CurrentDate;

  public climate: Climate = new Climate(); // Current climate

  public lastTemp: number; // Last temperature in farenheit
  public precipitation: string; // Description of current weather
  public temp: number; // Current temperature in farenheit
  public get tempRange(): { min: number, max: number } { return this.climate.temperatureRange; } // Temperature range of the current season
  public set tempRange(range: { min: number, max: number }) { this.climate.temperatureRange = range; } // Temperature range of the current season

  /**
   * TODO: Should be moved into Climate/Biome data
   *@deprecated
   */
  public isVolcanic: boolean;

  constructor(properties: Partial<WeatherData> = {}) {
    Object.assign(this, properties);
  }
}
