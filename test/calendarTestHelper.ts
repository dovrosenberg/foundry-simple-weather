import { calendarManager, CalendarType } from '@/calendar/CalendarManager';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

/**
 * Information about a calendar module being tested
 */
export interface CalendarTestInfo {
  type: CalendarType;
  name: string;
}

/**
 * Detects all available calendar modules for testing.
 * @returns Array of calendar types that are available
 */
export const detectAvailableCalendarsForTesting = (): CalendarTestInfo[] => {
  const available = calendarManager.detectAllAvailableCalendars();

  // If calendars were detected through the manager, use those
  if (available.length > 0) {
    return available.map(cal => ({
      type: cal.type,
      name: getCalendarName(cal.type)
    }));
  }

  // Fall back to checking global scope for available calendars
  const fallbackCalendars: CalendarTestInfo[] = [];

  if (typeof (globalThis as any).CALENDARIA !== 'undefined') {
    fallbackCalendars.push({
      type: CalendarType.CALENDARIA,
      name: 'Calendaria'
    });
  }

  if (typeof (globalThis as any).SimpleCalendar !== 'undefined') {
    fallbackCalendars.push({
      type: CalendarType.SIMPLE_CALENDAR,
      name: 'Simple Calendar'
    });
  }

  if (fallbackCalendars.length > 0) {
    return fallbackCalendars;
  }

  // If nothing is detected, return Simple Calendar as a default
  // The tests will fail if it's not actually available, but at least they'll be registered
  return [{
    type: CalendarType.SIMPLE_CALENDAR,
    name: 'Simple Calendar'
  }];
};

/**
 * Gets a human-readable name for a calendar type
 */
const getCalendarName = (type: CalendarType): string => {
  switch (type) {
    case CalendarType.CALENDARIA:
      return 'Calendaria';
    case CalendarType.SIMPLE_CALENDAR:
      return 'Simple Calendar';
    case CalendarType.SIMPLE_CALENDAR_REBORN:
      return 'Simple Calendar Reborn';
    default:
      return 'Unknown Calendar';
  }
};

/**
 * Runs a test batch for each available calendar module.
 * This wraps the standard quench.registerBatch to run the tests multiple times,
 * once for each calendar module that's available.
 *
 * @param baseName The base name for the test batch (will be suffixed with calendar name)
 * @param testFn The test function to run (receives QuenchBatchContext)
 * @param calendars Optional specific calendars to test (defaults to all available)
 */
export const runTestsForEachCalendar = (
  baseName: string,
  testFn: (context: QuenchBatchContext) => void,
  calendars?: CalendarTestInfo[]
): void => {
  const calendarModules = calendars || detectAvailableCalendarsForTesting();

  for (const calendar of calendarModules) {
    const batchName = `${baseName} [${calendar.name}]` as `${string}.${string}`;

    quench.registerBatch(batchName, (context: QuenchBatchContext) => {
      const { before, after } = context;
      let previousCalendarState: any;

      // Set the calendar before running the tests
      before(() => {
        // Save the previous calendar state
        previousCalendarState = calendarManager.currentCalendar;

        // Set the calendar for this test batch
        calendarManager.setCalendar(calendar.type, true);
      });

      // Run the actual test function
      testFn(context);

      // Clean up after this calendar's tests
      after(() => {
        // Ensure all sinon stubs are cleaned up
        try {
          // @ts-ignore - sinon may be available globally
          if (typeof sinon !== 'undefined' && sinon?.restore) {
            // @ts-ignore
            sinon.restore();
          }
        } catch (e) {
          // Ignore if sinon is not available
        }

        // Reset to NONE to ensure clean state for next batch
        calendarManager.setCalendar(CalendarType.NONE, true);
      });
    });
  }
};

/**
 * Helper function to set up calendar for a test batch without parameterization.
 * Use this for tests that need a calendar but don't need to run for each calendar type.
 *
 * @param context The QuenchBatchContext
 * @param calendarType The specific calendar type to use
 */
export const setupCalendarForTest = (
  context: QuenchBatchContext,
  calendarType: CalendarType = CalendarType.SIMPLE_CALENDAR
): void => {
  const { before } = context;

  before(() => {
    calendarManager.setCalendar(calendarType, true);
  });
};
