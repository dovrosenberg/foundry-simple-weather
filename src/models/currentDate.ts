export class RawDate {
  public year: number;
  public month: number;
  public weekdays: string[];
  public currentWeekdayIndex: number;
  public day: number;
  public hour: number;
  public minute: number;
  public second: number;
}

export class FormattedDate {
  public fullDate: string;
  public time: string;
}

export class CurrentDate {
  public raw: RawDate;
  public display: FormattedDate;
}

const DEFAULT_RAW_DATE = new RawDate();
DEFAULT_RAW_DATE.year = null;
DEFAULT_RAW_DATE.month = null;
DEFAULT_RAW_DATE.weekdays = null;
DEFAULT_RAW_DATE.currentWeekdayIndex = null;
DEFAULT_RAW_DATE.day = null;
DEFAULT_RAW_DATE.hour = null;
DEFAULT_RAW_DATE.minute = null;
DEFAULT_RAW_DATE.second = null;

const DEFAULT_FORMATTED_DATE = new FormattedDate();
DEFAULT_FORMATTED_DATE.fullDate = null;
DEFAULT_FORMATTED_DATE.time = null;

export const DEFAULT_CURRENT_DATE = new CurrentDate();
DEFAULT_CURRENT_DATE.raw = DEFAULT_RAW_DATE;
DEFAULT_CURRENT_DATE.display = DEFAULT_FORMATTED_DATE;
