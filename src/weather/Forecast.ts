import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, HexFlowerCell, Humidity } from './climateData';
import { weatherDescriptions, weatherSunniness, weatherTemperatures } from './weatherMap';
import { getCalendarAdapter } from '@/calendar';

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
  public timestamp: number;      // the timestamp of the forecast
  public humidity: Humidity;    // the humidity selection
  public climate: Climate;      // the climate selection
  public hexFlowerCell: HexFlowerCell;      // number of the cell in the hex flower

  constructor(timestamp: number, climate: Climate, humidity: Humidity, hexFlowerCell: HexFlowerCell) {
    this.timestamp = timestamp;
    this.climate = climate;
    this.humidity = humidity;
    this.hexFlowerCell = hexFlowerCell;
  }

  // getters
  get sunniness(): Sunniness {
    return weatherSunniness[this.climate][this.humidity][this.hexFlowerCell];
  }

  get description(): string {
    const calendarAdapter = getCalendarAdapter();
    const dayOfWeek = calendarAdapter?.timestampToDate(this.timestamp)?.display.weekday || '';

    return `${dayOfWeek} - ${weatherDescriptions[this.climate][this.humidity][this.hexFlowerCell]} (${this.temperature})`;
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

      case Sunniness.WildFire:
        return 'fa-fire';

      default:
        return '';
    }
  }
}

