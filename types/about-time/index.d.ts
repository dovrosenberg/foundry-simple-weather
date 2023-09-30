
declare class Gametime {
  static weekDays: string[];
  static DTC: DTCalc;
  static calendars: Object;

  static isMaster(): boolean;
  static isRunning(): boolean;
  static startRunning(): void;
  static stopRunning(): void;
  static DTNow(): DateTime;
  static DTf({years=DTCalc.clockStartYear, months=0, days=0, hours=0, minutes=0, seconds=0}={}): DateTime;
  static setAbsolute({years = 0, months = 0, days = 0,hours = 0, minutes = 0, seconds = 0}): DateTime;
  static advanceClock(timeIncrement: number): void;
  static advanceTime(spec = {}): void;
  static _save(force?: boolean): void;
  static setTime({hours=0, minutes=0, seconds=0}): void;
  static doIn(when: DTMod, handler: (...args) => any, ...args): number;
  static doAt(when: DateTime, handler: (...args) => any, ...args): number;
  static reminderAt(when: DateTime, ...args): number;
}

/**
 * @deprecated
 */
declare class DateTime extends DTMod {
  /**
   * Returns the Day Of the Week (dow) for a given DateTime (0=Monday or equivalent)
   */
  public dow(): number;

  public shortDate(): {date: string, time: string}
  public setAbsolute({years=null, months=null, days=null, hours=null, minutes=null, seconds=null}={}): DateTime
  public add(increment: DTMod): DateTime;

  /**
   * Returns the number of days represented by a date. Returns the residual hours minutes seconds as well.
   */
  public toDays(): {days: number, time: DTMod};

  /**
   * convert the date to a number of Seconds.
   */
  public toSeconds(): number;

  /**
   * Adjust the calendar so that the dow() of this will be dow
   * @param dow the new dow for this.
   */
  public setCalDow(dow: number): void;
}

declare class DTMod {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;

  constructor({years = 0, months = 0, days = 0,hours = 0, minutes = 0, seconds = 0})

  static create(data = {}): DTMod;
}

declare class DTCalc {
  dpy: any[];
  spm: number;
  mph: number;
  hpd: number;
  spd: number;
  spw: number;
  sph: number;
  dpm: [number];
  spy: number;
  mpy: number;

  months: Array<string>;
  month_len: any;
  dpw: number;
  startYear: number; // calendar start year
  clockStartYear: number;
  weekDays: string[];
  leapYearRule: (number) => number;
  firstDay;
  hasYearZero: boolean;
  yearlyICDays: number; // for dow calculations
  ICMonths : number[];
  cumICDays: number[];
  hasYearNames: boolean = false;
  yearNames: string[];
  namedYears: {};

  public saveUserCalendar(newCalendarSpec: any): void;
  public createFromData(calendarSpec?: any):void;
}
