// we do a lot of date comparison... use this to strip times because as of right now, we don't care 
import { CalendarDate, ICalendarAdapter } from '@/calendar';

/** @returns the timestamp of the 0:00 time for the day -- our standard time for the date */
function cleanDate(adapter: ICalendarAdapter, date: CalendarDate): number;
function cleanDate(adapter: ICalendarAdapter, date: null): null;
function cleanDate(adapter: ICalendarAdapter, date: CalendarDate | null): number | null {
  // we need to always standardize on a time or else forecasts don't index properly
  // easiest is to use all 0 time 
  if (!date)
    return null;

  return adapter.dateToTimestamp({
    ...date,
    hour: 0,
    minute: 0,
    display: {
      ...date.display,
      time: '0:00'
    }
  });
}

export { 
  cleanDate,
}