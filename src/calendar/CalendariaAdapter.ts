import { Season, } from '@/weather/climateData';
import { ICalendarAdapter, CalendarDate, TimeInterval } from './ICalendarAdapter';
import { WeatherApplication } from '@/applications/WeatherApplication';
import { id as moduleId } from '@module';

type CalendariaDate = {
  /** day of month, 1 indexed */
  day: number;

  /** month, 0 indexed */
  month: number;

  /** raw year */
  year: number; 

  hour: number;
  minute: number;
}

type CalendariaAPI = {
  getCurrentDateTime: () => CalendariaDate;
  dateToTimestamp: (date: CalendariaDate) => number;
  timestampToDate: (timestamp: number) => CalendariaDate;
  getCurrentSeason: (date?: CalendariaDate) => { seasonalType: string };
  formatDate: (date: CalendariaDate, format: string) => string;
  addYears: (date: CalendariaDate, years: number) => CalendariaDate;
  addMonths: (date: CalendariaDate, months: number) => CalendariaDate;
  addDays: (date: CalendariaDate, days: number) => CalendariaDate;
  createNote: (note: any) => Promise<JournalEntryPage>;
  deleteNote: (noteId: string) => void;
  getNotesForDate: (year: number, month: number, day: number) => { journalId: string }[];
  registerWidget: (moduleId: string, widget: {
    id: string;
    type: string;
    replaces: string;
    icon: string;
    label: string;
    onClick: () => void;
  }) => void;
}

export class CalendariaAdapter implements ICalendarAdapter<CalendariaDate> {
  public name = 'CalendariaAdapter';

  private api: CalendariaAPI;

  constructor() {
    // Calendaria exposes its API on the global CALENDARIA object
    this.api = (globalThis as any).CALENDARIA?.api;
  }

  private ensureApi(): void {
    if (!this.api) {
      throw new Error('Calendaria API not available');
    }
  }

  public getCurrentTimestamp(): number {
    this.ensureApi();
    const currentDate = this.api.getCurrentDateTime() as CalendariaDate;
    return this.api.dateToTimestamp(currentDate);
  }
  
  public CalendarDateToAPIDate(date: CalendarDate): CalendariaDate {
    return {
      year: date.year,
      month: date.month,
      day: date.day + 1,
      hour: date.hour,
      minute: date.minute
    };
  }

  public APIDateToCalendarDate(date: CalendariaDate): CalendarDate {
    // map the season from the icons
    const seasonType = this.api.getCurrentSeason(date)?.seasonalType as string ?? '';
    const seasonMap = {
      'winter': Season.Winter,
      'autumn': Season.Fall,
      'summer': Season.Summer,
      'spring': Season.Spring
    }

    return {
      year: date.year,
      month: date.month,
      day: date.day - 1,
      hour: date.hour,
      minute: date.minute,
      season: seasonMap[seasonType] ?? Season.Spring,
      weekday: this.api.formatDate(date, 'EEEE'),
      display: {
        weekday: this.api.formatDate(date, 'EEEE'),
        date: this.api.formatDate(date, 'MMMM D, YYYY'),
        day: this.api.formatDate(date, 'D'),
        month: this.api.formatDate(date, 'MMMM'),
        year: this.api.formatDate(date, 'YYYY'),
        time: this.api.formatDate(date, 'hh:mm')
      }
    };
  }

  public timestampToDate(timestamp: number): CalendarDate | null {
    this.ensureApi();

    const date = this.api.timestampToDate(timestamp);
    if (!date) 
      return null;

    return this.APIDateToCalendarDate(date);
  }

  public dateToTimestamp(date: CalendarDate): number {
    this.ensureApi();

    return this.api.dateToTimestamp(this.CalendarDateToAPIDate(date));
  }

  public timestampPlusInterval(timestamp: number, interval: TimeInterval): number {
    this.ensureApi();

    // We need to convert to date, add the interval, and convert back
    let date = this.api.timestampToDate(timestamp);
    if (!date) {
      throw new Error('Failed to convert timestamp to date');
    }

    if (interval.year)
      date = this.api.addYears(date, interval.year);
    if (interval.month)
      date = this.api.addMonths(date, interval.month);
    if (interval.day)
      date = this.api.addDays(date, interval.day);

    // Convert back to timestamp using Calendaria's API
    return this.api.dateToTimestamp(date);
  }

  public getNotesForDay(date: CalendarDate): JournalEntry[] {
    this.ensureApi();
    const notes = this.api.getNotesForDate(date.year, date.month, date.day);

    // Calendaria returns note stubs, we need to return them as JournalEntry objects
    return notes.map((note: { journalId: string }) => JournalEntry.get(note.journalId)) || [];
  }

  public async addNote(
    title: string,
    content: string,
    startDate: CalendarDate,
    endDate: CalendarDate,
    isPublic: boolean = true
  ): Promise<JournalEntry> {
    this.ensureApi();

    const startDateCalendaria = this.CalendarDateToAPIDate(startDate);
    const endDateCalendaria = this.CalendarDateToAPIDate(endDate);

    const page = await this.api.createNote({
      name: title,
      content: content,
      startDate: startDateCalendaria,
      endDate: endDateCalendaria,
      allDay: true,
      gmOnly: !isPublic
    });

    return page.parent;
  }

  public async removeNote(noteId: string): Promise<void> {
    this.ensureApi();
    await this.api.deleteNote(noteId);
  }

  public addSidebarButton(weatherApplication: WeatherApplication, onClick: () => void): void {
    this.ensureApi();

    this.api.registerWidget(moduleId, {
      id: 'swr-calendaria-button',
      type: 'indicator',
      replaces: 'weather-indicator',
      icon: 'fas fa-cloud-sun',
      label: 'Simple Weather',
      onClick: () => onClick()
    });

    // Calendaria doesn't appear to have a direct sidebar button API
    Hooks.on('renderMiniCalendar', (/*application: Application, html: HTMLElement*/): void => {
      weatherApplication.render();
    });
  }

  public inject(html: JQuery<HTMLElement>, hidden: boolean): string {
    const elementId = this.wrapperElementId;
    
    if (!hidden) {
      // turn off any existing calendar panels
      // const existingPanels = $(`#${SimpleCalendarAdapter.SC_ID_FOR_WINDOW_WRAPPER} .window-content`).find(`.${SimpleCalendarAdapter.SC_CLASS_FOR_TAB_WRAPPER}.${SimpleCalendarAdapter.SC_CLASS_FOR_TAB_EXTENDED}`);
      // existingPanels.addClass(SimpleCalendarAdapter.SC_CLASS_FOR_TAB_CLOSED).removeClass(SimpleCalendarAdapter.SC_CLASS_FOR_TAB_EXTENDED);

      // if it's there we'll replace, otherwise we'll append      
      if ($(`#${elementId}`).length === 0) {
        // attach to the calendar
        const targetPanel = $('#mini-calendar .mini-notes-panel');
        if (targetPanel.length === 0) {
          console.error('Calendaria: Could not find #mini-calendar .mini-notes-panel to inject weather panel');
          return '';
        }
      
        targetPanel.after(html);
        $(`#${elementId}`).addClass('visible');
      } else {
        $(`#${elementId}`).replaceWith(html);
        $(`#${elementId}`).addClass('visible');
      }
    } else {
      // hide it
      $(`#${elementId}`).removeClass('visible');
    }      
    
    return elementId;
  }

  public activateListeners(_hiddenCallback: (hidden: boolean) => void): void {    
  }

  public get containerClasses(): string {
    return '';
  }

  public get wrapperElementId(): string {
    return 'swr-calendaria-container';
  }


  public get hooks(): { init: string } {
    return {
      init: 'calendaria.ready'
    };
  }
}
