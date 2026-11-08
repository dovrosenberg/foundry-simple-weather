export * from './CalendarManager';
export * from './ICalendarAdapter';
export * from './SimpleCalendarRebornAdapter';
export * from './CalendariaAdapter';

// Convenience function to get the current calendar adapter
import { calendarManager } from './CalendarManager';
export function getCalendarAdapter() {
  return calendarManager.getAdapter();
}
