import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, Humidity } from './climateData';
import { weatherSunniness, weatherTemperatures } from './weatherMap';

// the types of "sunniness"
export enum Sunniness {
  Clear,   // fa-sun
  PartlyCloudy,   // fa-cloud-sun
  MostlyCloudy,   // fa-cloud  -- don't differentiate with Cloudy for now
  Cloudy,   // fa-cloud
  Precipitation   // fa-cloud-rain
}

// describes a weather forecast
export class Forecast {
  public humidity: Humidity;    // the humidity selection
  public climate: Climate;      // the climate selection
  public hexFlowerCell: number;      // number of the cell in the hex flower

  constructor(climate: Climate, humidity: Humidity, hexFlowerCell: number) {
    this.climate = climate;
    this.humidity = humidity;
    this.hexFlowerCell = hexFlowerCell;
  }

  // getters
  get sunniness(): Sunniness {
    return weatherSunniness[this.climate][this.humidity][this.hexFlowerCell];
  }

  get temperature(): string {
    const temperature = weatherTemperatures[this.climate][this.humidity][this.hexFlowerCell];

    if (temperature===null || temperature===undefined)
      return '';
    
    if (ModuleSettings.get(ModuleSettingKeys.useCelsius))
      return Math.floor((temperature-32)*5/9) + '°C';
    else 
      return temperature + '°F';
  };
}

