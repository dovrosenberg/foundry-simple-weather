import { Season, Climate, Humidity, HexFlowerCell } from '@/weather/climateData';
import { weatherDescriptions } from '@/weather/weatherMap';
import { Icons } from 'foundryvtt-simple-calendar/src/constants';
  
// describes the weather for a day
// we can use humidity, climate, and gridCell to determine the text description
// season is only used so that if we want to pick the next day's weather we can tell if we've changed seasons
export class WeatherData {
  public date: SimpleCalendar.DateData | null;
  public season: Season | null;        // which season we were in (i.e. actually using for weather)
  public humidity: Humidity | null;    // the humidity selection
  public climate: Climate | null;      // the climate selection
  public hexFlowerCell: HexFlowerCell | null;      // number of the cell in the hex flower
  public temperature: number | null;   // the temperature (with random variation) in F
  public manualOnly: boolean | false;    // was this set manually to an invalid local weather... if yes, the next generation will reset to a starting point

  constructor(date: SimpleCalendar.DateData | null, season: Season | null, humidity: Humidity | null, climate: Climate | null, hexFlowerCell: HexFlowerCell | null, temperature: number | null) {
    this.date = date;
    this.season = season;
    this.humidity = humidity;
    this.climate = climate;
    this.hexFlowerCell = hexFlowerCell;
    this.temperature = temperature;
    this.manualOnly = false;
  }

  // getters
  get simpleCalendarSeason(): Season | null {
    const icon = this.date?.currentSeason?.icon || '';

    const seasons = {
      [Icons.Fall]: Season.Fall,
      [Icons.Winter]: Season.Winter,
      [Icons.Spring]: Season.Spring,
      [Icons.Summer]: Season.Summer,
    };

    return seasons[icon] !== undefined ? seasons[icon] : null;
  }

  public getTemperature = (useCelsius: boolean): string => {
    if (this.temperature===null)
      return '';

    if (useCelsius)
      return Math.floor((this.temperature-32)*5/9) + '°C';
    else 
      return this.temperature + '°F';
  };

  public getDescription = (): string => {  
    if (this.climate==null || this.humidity==null || this.hexFlowerCell==null)
      return '';

    return weatherDescriptions[this.climate][this.humidity][this.hexFlowerCell];
  };

  /** makes sure the climate, humidity, and cell are valid */
  static validateWeatherParameters = (climate: Climate | null, humidity: Humidity | null, hexFlowerCell: HexFlowerCell | null): boolean => {
    if (climate==null || !Object.values(Climate).includes(climate))
      return false;
    if (humidity==null || !Object.values(Humidity).includes(humidity))
      return false;
    if (hexFlowerCell==null || !(/^\d+$/.test(hexFlowerCell as unknown as string)) || hexFlowerCell<0 || hexFlowerCell > 36)
      return false;
    
    return true;
  }
}

