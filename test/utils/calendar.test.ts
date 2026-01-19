import { cleanDate } from '@/utils/calendar';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { runTestsForEachCalendar } from '@test/calendarTestHelper';
import { calendarManager } from '@/calendar/CalendarManager';

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
            season: 2,
            display: {
              date: '6/15/2024'
            }
          };
      
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
        });
      });
    }
  )
};
