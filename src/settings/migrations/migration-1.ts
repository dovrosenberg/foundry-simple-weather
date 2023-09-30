import { Climate } from '@/models/climate';
import { CurrentDate } from '@/models/currentDate';

import { Date, DateTime } from '../../libraries/simple-calendar/dateTime';
import { Migration } from './migration';

interface PreviousWeatherData {
  version: number,
  dateTime: DateTime,
  cTemp: number,
  climate: Climate,
  isVolcanic: boolean,
  lastTemp: number,
  precipitation: string,
  temp: number,
  tempRange: { min: number, max: number },
}

interface TargetWeatherData {
  version: number,
  currentDate: CurrentDate,
  climate: Climate,
  isVolcanic: boolean,
  lastTemp: number,
  precipitation: string,
  temp: number,
  tempRange: { min: number, max: number },
}

export class Migration1 extends Migration {

  constructor() {
    const version = 1;
    super(version);
  }

  public migrate(previous: PreviousWeatherData): TargetWeatherData  {
    const data: TargetWeatherData = {
      version: 1,
      currentDate: this.migrateToCurrentDate(previous),
      climate: previous.climate,
      isVolcanic: previous.isVolcanic,
      lastTemp: previous.lastTemp,
      precipitation: previous.precipitation,
      temp: previous.temp,
      tempRange: previous.tempRange,
    };
    return data;
  }

  private migrateToCurrentDate(previous: PreviousWeatherData): TargetCurrentDate {
    const previousDate: Date = previous.dateTime.date;
    const date: TargetCurrentDate = { raw: null, display: null };
    date.raw = {
      year: previousDate.year,
      month: previousDate.month,
      weekdays: previousDate.weekdays,
      currentWeekdayIndex: previousDate.dayOfTheWeek,
      day: previousDate.day,
      hour: previousDate.hour,
      minute: previousDate.minute,
      second: previousDate.second,
    };
    date.display = {
      fullDate: previousDate.display.date,
      time: previousDate.display.time
    };

    return date;
  }
}

class TargetRawDate {
  public year: number;
  public month: number;
  public weekdays: string[];
  public currentWeekdayIndex: number;
  public day: number;
  public hour: number;
  public minute: number;
  public second: number;
}

class TargetFormattedDate {
  public fullDate: string;
  public time: string;
}

class TargetCurrentDate {
  public raw: TargetRawDate;
  public display: TargetFormattedDate;
}
