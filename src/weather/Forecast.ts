import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, Humidity } from './climateData';
import { weatherSunniness, weatherTemperatures } from './weatherMap';

// the types of "sunniness"
export enum Sunniness {
  Clear,   // fa-sun
  PartlyCloudy,   // fa-cloud-sun
  MostlyCloudy,   // fa-cloud  -- don't differentiate with Cloudy for now
  Cloudy,   // fa-cloud
  Fog,   // fa-smog
  LightRain,   // fa-cloud-rain
  HeavyRain,   // fa-cloud-showers-heavy
  Snow,   // fa-snowflake
  Wind,   // fa-wind
  Lightning,   // fa-cloud-bolt
  Tornado,   // fa-tornado
  WildFire,   // fa-fire
}

// describes a weather forecast
export class Forecast {
  public humidity: Humidity;    // the humidity selection
  public climate: Climate;      // the climate selection
  public hexFlowerCell: number;      // number of the cell in the hex flower

  constructor(forecast: Forecast) {
    this.climate = forecast.climate;
    this.humidity = forecast.humidity;
    this.hexFlowerCell = forecast.hexFlowerCell;
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

  get icon(): string {
    switch (this.sunniness) {
      case Sunniness.Clear:
        return 'fa-sun';
      
      case Sunniness.PartlyCloudy:
        return 'fa-cloud-sun';

      case Sunniness.MostlyCloudy:
      case Sunniness.Cloudy:
        return 'fa-cloud';

      case Sunniness.Fog:
        return 'fa-smog';

      case Sunniness.LightRain:
        return 'fa-cloud-rain';
        
      case Sunniness.HeavyRain:
        return 'fa-cloud-showers-heavy';

      case Sunniness.Snow:
        return 'fa-snowflake';

      case Sunniness.Wind:
        return 'fa-wind';

      case Sunniness.Lightning:
        return 'fa-cloud-bolt';

      case Sunniness.Tornado:
        return 'fa-tornado';

      case Sunniness.Wildfire:
        return 'fa-fire';

      default:
        return '';
    }
  }
}

