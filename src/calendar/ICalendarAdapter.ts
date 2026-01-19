import { WeatherApplication } from '@/applications/WeatherApplication';

export interface CalendarDate {  
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  season?: number;
  weekday?: string;
  display: {
    weekday?: string;
    month?: string;
    day?: string;
    year?: string;
    time?: string;
    date?: string;
  };
}

export interface TimeInterval {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
}

export interface ICalendarAdapter {
  name: string;  // adapter name

  // Core date/time methods
  getCurrentTimestamp(): number;
  timestampToDate(timestamp: number): CalendarDate | null;
  dateToTimestamp(date: CalendarDate): number;
  timestampPlusInterval(timestamp: number, interval: TimeInterval): number;
  
  // Note management
  getNotesForDay(year: number, month: number, day: number): JournalEntry.ConfiguredInstance[];
  addNote(title: string, content: string, startDate: CalendarDate, endDate: CalendarDate, isPublic?: boolean): Promise<JournalEntry.ConfiguredInstance>;
  removeNote(noteId: string): Promise<void>;
  
  // UI integration
  addSidebarButton(weatherApplication: WeatherApplication, onClick?: () => void): void;
  inject(html: JQuery<HTMLElement>, hidden: boolean): string;  // called when the calendar is rendered if we need to show our window; returns container elementId
  activateListeners(hiddenCallback: (hidden: boolean) => void): void;  // called when the calendar is rendered if we need to attach any listeners
  get containerClasses(): string;
  get wrapperElementId(): string;
  
  // Hooks/events
  get hooks(): {
    init: string;
  };
}
