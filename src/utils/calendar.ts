// we do a lot of date comparison... use this to strip times because as of right now, we don't care 
import { CalendarDate, ICalendarAdapter } from '@/calendar';
import { Season } from '@/weather/climateData';

/** @returns the timestamp of the 0:00 time for the day -- our standard time for the date */
function cleanDate<APIDate>(adapter: ICalendarAdapter<APIDate>, date: CalendarDate): number;
function cleanDate<APIDate>(adapter: ICalendarAdapter<APIDate>, date: null): null;
function cleanDate<APIDate>(adapter: ICalendarAdapter<APIDate>, date: CalendarDate | null): number | null {
  // we need to always standardize on a time or else forecasts don't index properly
  // easiest is to use all 0 time 
  if (!date)
    return null;

  // some old dates have the simple calendar season format... clean that up too
  if ((date as any).currentSeason) {
    const seasonMap = {
      'spring': Season.Spring,
      'summer': Season.Summer,
      'fall': Season.Fall,
      'winter': Season.Winter
    };
    
    date.season = seasonMap[(date as any).currentSeason.icon] ?? Season.Spring;
  }

  return adapter.dateToTimestamp({
    year: date.year,
    month: date.month,
    day: date.day,
    hour: 0,
    minute: 0,  
    season: date.season,
    weekday: date.weekday,
    display: {
      weekday: date.display?.weekday || undefined,
      month: date.display?.month || undefined,
      day: date.display?.day || undefined,
      year: date.display?.year || undefined,
      date: date.display?.date || undefined,
      time: '0:00'
    }
  });
}

export { 
  cleanDate,
}