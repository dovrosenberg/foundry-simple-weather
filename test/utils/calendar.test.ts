import { cleanDate } from '@/utils/calendar';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { runTestsForEachCalendar } from '@test/calendarTestHelper';
import { calendarManager } from '@/calendar/CalendarManager';
import { Season } from '@/weather/climateData';
import { CalendarDate } from '@/calendar';

export const registerCalendarTests = () => {
  runTestsForEachCalendar(
    'simple-weather.utils.calendar',
    (context: QuenchBatchContext) => {
      const { describe, it, expect } = context;

      describe('cleanDate', () => {
        it('should return the timestamp of 0:00 (midnight)', () => {
          const testDate = {
            year: 2025,
            month: 6,
            day: 15,
            hour: 14,
            minute: 30,
            season: Season.Summer,
            display: {
              weekday: 'Friday',
              date: 'July 16, 2025',
              day: '16',
              month: 'July',
              year: '2025',
              time: '14:30'
            }
          } as CalendarDate;
      
          const adapter = calendarManager.getAdapter();
          expect(adapter).to.not.be.null;
          
          // Get the cleaned timestamp
          const cleanedTimestamp = cleanDate(adapter!, testDate);
          
          // Convert it back to a date to verify the time is 0:00
          const cleanedDate = adapter!.timestampToDate(cleanedTimestamp);
          expect(cleanedDate).to.not.be.null;
          expect(cleanedDate!.hour).to.equal(0);
          expect(cleanedDate!.minute).to.equal(0);
          expect(cleanedDate!.year).to.equal(testDate.year);
          expect(cleanedDate!.month).to.equal(testDate.month);
          expect(cleanedDate!.day).to.equal(testDate.day);
          expect(cleanedDate!.display.date).to.equal(testDate.display.date);
        });
      });
    }
  )
};
