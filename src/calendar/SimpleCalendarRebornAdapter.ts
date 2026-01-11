import { ICalendarAdapter, SimpleCalendarDate, CalendarNote, TimeInterval } from './ICalendarAdapter';

export class SimpleCalendarRebornAdapter implements ICalendarAdapter {
  private api: any;
  
  constructor() {
    // Simple Calendar Reborn also exposes its API similarly to the original
    this.api = (globalThis as any).SimpleCalendar?.api;
  }
  
  private ensureApi(): void {
    if (!this.api) {
      throw new Error('Simple Calendar Reborn API not available');
    }
  }
  
  public getCurrentTimestamp(): number {
    this.ensureApi();
    return this.api.timestamp();
  }
  
  public timestampToDate(timestamp: number): SimpleCalendarDate | null {
    this.ensureApi();
    const date = this.api.timestampToDate(timestamp);
    if (!date) return null;
    
    // Transform to our interface format
    return {
      year: date.year,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
      seconds: date.seconds,
      sunset: date.sunset,
      sunrise: date.sunrise,
      currentSeason: date.currentSeason,
      weekdays: date.weekdays,
      dayOfTheWeek: date.dayOfTheWeek,
      display: date.display || {}
    };
  }
  
  public timestampPlusInterval(timestamp: number, interval: TimeInterval): number {
    this.ensureApi();
    return this.api.timestampPlusInterval(timestamp, interval);
  }
  
  public async getNotesForDay(year: number, month: number, day: number): Promise<CalendarNote[]> {
    this.ensureApi();
    const notes = this.api.getNotesForDay(year, month, day);
    
    // Transform Foundry documents to our interface
    return notes.map((note: any) => ({
      id: note.id,
      title: note.name,
      content: note.content,
      date: this.timestampToDate(note.date) || { year, month, day, display: {} }
    }));
  }
  
  public async addNote(title: string, content: string, startDate: SimpleCalendarDate, endDate: SimpleCalendarDate, isPublic: boolean = true): Promise<CalendarNote> {
    this.ensureApi();
    const note = await this.api.addNote(title, content, startDate, endDate, isPublic);
    
    return {
      id: note.id,
      title: note.name,
      content: note.content,
      date: this.timestampToDate(note.date) || startDate
    };
  }
  
  public async removeNote(noteId: string): Promise<void> {
    this.ensureApi();
    await this.api.removeNote(noteId);
  }
  
  public addSidebarButton(onClick: () => void): void {
    this.ensureApi();
    this.api.addSidebarButton('Simple Weather', 'fa-cloud-sun', '', false, onClick);
  }
  
  public getHooks(): { init: string } {
    return {
      init: (globalThis as any).SimpleCalendar?.Hooks?.Init,
    };
  }
}
