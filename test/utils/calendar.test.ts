import { cleanDate } from '@/utils/calendar';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const registerCalendarTests = () => {
  quench.registerBatch(
    'simple-weather.utils.calendar',
    (context: QuenchBatchContext) => {
      const { describe, it, expect } = context;

      describe('cleanDate', () => {
        it('should return the timestamp of the sunset', () => {
          const testDate = {
            year: 0,
            month: 12,
            day: 31,
            dayOffset: 2,
            sunrise: 1,
            sunset: 3,
          };
      
          expect(cleanDate(testDate as SimpleCalendar.DateData)).to.equal(3);
        });
      });
    }
  )
};
