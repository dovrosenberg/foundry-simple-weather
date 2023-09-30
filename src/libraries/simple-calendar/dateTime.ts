// Documentation: https://github.com/vigoren/foundryvtt-simple-calendar/blob/main/docs/Hooks.md#season-properties

interface Season {
  /**
   * The name of the season.
   */
  name: string;

  /**
   * The color associated with this season.
   */
  color: string;

  /**
   * The day index of the month that the season starts on.
   */
  startingDay: number;

  /**
   * The month index that the season starts on.
   */
  startingMonth: number;
}

interface Moon {
  /**
   * The color associated with the moon.
   */
  color: string;

  /**
   * The moon phase for the current date. This option is present only in results from the DateTimeChange hook
   */
  currentPhase: MoonPhase;

  /**
   * A way to nudge the cycle calculations to align with correct dates.
   */
  cycleDayAdjust: number;

  /**
   * How many days it takes the moon to complete 1 cycle.
   */
  cycleLength: number;

  /**
   * When the first new moon was. This is used to calculate the current phase for a given day.
   */
  firstNewMoon: FirstNewMoon;

  /**
   * The name of the moon.
   */
  name: string;

  /**
   * The different phases of the moon.
   */
  phases: MoonPhase[];
}

interface MoonPhase {
  /**
   * The icon to associate with this moon phase.
   * @type enum
   */
  icon: any;

  /**
   * How many days of the cycle this phase takes up.
   */
  length: number;

  /**
   * The name of the phase.
   */
  name: string;

  /**
   * If this phase should only take place on a single day.
   */
  singleDay: boolean;
}

interface FirstNewMoon {
  /**
   * This is an enum that contains the options for when a moons first new moon year should be reset. Options are:

   * - None: The moons first new moon year is never reset.
   * - Leap Year: The moons first new moon year is reset every leap year.
   * - X Years: The moons first new moon year is reset every X years.
   * @type enum
   */
  yearReset: any,

  /**
   * Reset the new moon year every X years.
   */
  yearX: number,

  /**
   * The year of the first new moon.
   */
  year: number,

  /**
   * The month of the first new moon.
   */
  month: number,

  /**
   * The day of the first new moon.
   */
  day: number,
}

interface DateDisplay {
  /**
   * How the day is displayed, generally its number on the calendar.
   */
  day: string,

  /**
   * The Ordinal Suffix associated with the day number (st, nd, rd or th)
   */
  daySuffix: string,

  /**
   * The month number.
   */
  month: string,

  /**
   * The name of the month.
   */
  monthName: string,

  /**
   * The hour, minute and seconds.
   */
  time: string,

  /**
   * The name of the weekday this date falls on.
   */
  weekday: string,

  /**
   * The year number
   */
  year: string,

  /**
   * The name of the year, if year names have been set up.
   */
  wearName: string,

  /**
   * The postfix value for the year
   */
  yearPostfix: string,

  /**
   * The prefix value for the year
   */
  yearPrefix: string,

  /**
   * The formatted date string based on the format set in the configuration for the date.
   */
  date: string,
}

export class Date {
  /**
   * The information for the season of the date, properties include "name" for the seasons name and "color" for the color associated with the season.
   */
  public currentSeason: Season;

  /**
   * The index of the day of the month represented in the timestamp.
   */
  public day: number;

  /**
   * The day of the week the day falls on.
   */
  public dayOfTheWeek: number;

  /**
   * The number of days that the months days are offset by.
   */
  public dayOffset: number;

  /**
   * All of the strings associated with displaying the date are put here.
   */
  public display: DateDisplay;

  /**
   * The hour represented in the timestamp.
   */
  public hour: number;

  /**
   * If this date falls on a leap year.
   */
  public isLeapYear: boolean;

  /**
   * The minute represented in the timestamp.
   */
  public minute: number;

  /**
   * The index of the month represented in the timestamp.
   */
  public month: number;

  /**
   * The name of the month.
   */
  public monthName: string;

  /**
   * The seconds represented in the timestamp.
   */
  public second: number;

  /**
   * If to show the weekday headings for the month.
   */
  public showWeekdayHeadings: boolean;

  /**
   * A list of weekday names.
   */
  public weekdays: string[];

  /**
   * The year represented in the timestamp.
   */
  public year: number;

  /**
   * The name of the year, if year names have been set up.
   */
  public yearName: string;

  /**
   * The postfix value for the year.
   */
  public yearPostfix: string;

  /**
   * The prefix value for the year.
   */
  public yearPrefix: string;

  /**
   * What is considered as year zero when doing timestamp calculations.
   */
  public yearZero: number;
}

/**
 * When it is emitted
 * This hook is emitted any time the current date is updated. The current date can be updated by several means:
 *
 * - When the GM clicks on the "Set Current Date" button after adjusting the current date.
 * - When the clock is running every interval update.
 * - When the Set Date/Time API function is called.
 * - When the Change Date/Time API function is called.
 * - When the game world time has changed and Simple Calendar is configured to update when that changes.
 */
export class DateTime {
  /**
   * This contains information about the current date of the calendar.
   */
  public date: Date;
  public moons: Moon;
}
