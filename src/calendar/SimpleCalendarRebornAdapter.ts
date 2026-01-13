import { Foundry } from '@/libraries/foundry/foundry';
import { ICalendarAdapter, CalendarDate, TimeInterval } from './ICalendarAdapter';

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
  
  public timestampToDate(timestamp: number): CalendarDate | null {
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
  
  public getNotesForDay(year: number, month: number, day: number): JournalEntry[] {
    this.ensureApi();
    const notes = this.api.getNotesForDay(year, month, day);
    
    return notes;
  }
  
  public async addNote(title: string, content: string, startDate: CalendarDate, endDate: CalendarDate, isPublic: boolean = true): Promise<JournalEntry> {
    this.ensureApi();
    const note = await this.api.addNote(title, content, startDate, endDate, isPublic);
    
    return note;
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
