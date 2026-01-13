export interface SimpleCalendarDate {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  sunset?: number;
  sunrise?: number;
  currentSeason?: {
    name: string;
    numericRepresentation: number;
    type: string;
    icon: string;
  };
  weekdays?: string[];
  dayOfTheWeek?: number;
  display: {
    weekday?: string;
    month?: string;
    day?: number;
    year?: number;
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
  second?: number;
}

export interface ICalendarAdapter {
  // Core date/time methods
  getCurrentTimestamp(): number;
  timestampToDate(timestamp: number): SimpleCalendarDate | null;
  timestampPlusInterval(timestamp: number, interval: TimeInterval): number;
  
  // Note management
  getNotesForDay(year: number, month: number, day: number): Promise<JournalEntry[]>;
  addNote(title: string, content: string, startDate: SimpleCalendarDate, endDate: SimpleCalendarDate, isPublic?: boolean): Promise<JournalEntry>;
  removeNote(noteId: string): Promise<void>;
  
  // UI integration
  addSidebarButton(onClick?: () => void): void;
  
  // Hooks/events
  getHooks(): {
    init: string;
  };
}
