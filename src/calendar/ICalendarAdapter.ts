import { WeatherApplication } from '@/applications/WeatherApplication';

//note: this is our internal calendar date format - it's not the same as Foundry's CalendarData
export interface CalendarDate {  
  /** raw year */
  year: number;

  /** month - 0 indexed */
  month: number;

  /** day of the month, 0 indexed */
  day: number; 
  hour: number;
  minute: number;
  season: number;
  weekday: string;
  display: {
    weekday: string;
    month: string;
    day: string;
    year: string;
    time: string;
    date: string;
  };
}

export interface TimeInterval {
  year?: number;
  month?: number;
  day?: number;
}

export interface ICalendarAdapter<APIDate> {
  name: string;  // adapter name

  // Core date/time methods
  APIDateToCalendarDate(date: APIDate): CalendarDate;
  CalendarDateToAPIDate(date: CalendarDate): APIDate;

  getCurrentTimestamp(): number;
  timestampToDate(timestamp: number): CalendarDate | null;
  dateToTimestamp(date: CalendarDate): number;
  timestampPlusInterval(timestamp: number, interval: TimeInterval): number;
  
  // Note management
  getNotesForDay(date: CalendarDate): JournalEntry[];
  addNote(title: string, content: string, startDate: CalendarDate, endDate: CalendarDate, isPublic?: boolean): Promise<JournalEntry>;
  removeNote(noteId: string): Promise<void>;
  
  // UI integration
  addSidebarButton(weatherApplication: WeatherApplication, onClick?: () => void): void;
  inject(html: JQuery<HTMLElement>, hidden: boolean): string;  // called when the calendar is rendered if we need to show our window; returns container elementId
  activateListeners(hiddenCallback: (hidden: boolean) => void): void;  // called when the calendar is rendered if we need to attach any listeners
  get containerClasses(): string;
  get wrapperElementId(): string;
  
  // Hooks/events
  get hooks(): { init: string };
}
