// we do a lot of date comparison... use this to strip times because as of right now, we don't care 
import { CalendarDate } from '@/calendar';

/** @returns the timestamp of the sunset -- our standard time for the date */
function cleanDate(date: CalendarDate): number;
function cleanDate(date: null): null;
function cleanDate(date: CalendarDate | null): number | null {
  // we use the sunset timestamp as the date -- we need to always standardize on a time or else forecasts don't index properly
  //   when called mid-day
  return date?.sunset || null;
}

export { 
  cleanDate,
}