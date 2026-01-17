import { ICalendarAdapter, CalendarDate, TimeInterval } from './ICalendarAdapter';
import { Season } from '@/weather/climateData';

export class SimpleCalendarRebornAdapter implements ICalendarAdapter {
  // classes for Simple Calendar injection
  // no  dot or # in front
  public static SC_CLASS_FOR_TAB_EXTENDED = 'fsc-c';    // open the search panel and find the siblings that are the panels and see what the different code is on search
  public static SC_CLASS_FOR_TAB_CLOSED = 'fsc-d';    // look at the other siblings or close search and see what changes
  public static SC_CLASS_FOR_TAB_WRAPPER = 'fsc-of';   // the siblings that are tabs all have it - also needs to go in .scss
  public static SC_ID_FOR_WINDOW_WRAPPER = 'fsc-if';  // it's the top-level one with classes app, window-app, simple-calendar

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
  
  public APIDateToCalendarDate(date: SimpleCalendar.DateData): CalendarDate {
    // season icons are weird
    const seasonMap = {
      'spring': Season.Spring,
      'summer': Season.Summer,
      'fall': Season.Fall,
      'winter': Season.Winter
    };

    return {
      year: date.year,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute,
      season: seasonMap[date.currentSeason.icon] ?? Season.Spring,
      weekday: date?.weekdays && date.dayOfTheWeek !== undefined 
        ? date.weekdays[date.dayOfTheWeek] 
        : undefined,
      display: {
        weekday: date.display.weekday,
        month: date.display.month,
        day: date.display.day,
        year: date.display.year,
        time: date.display.time,
        date: date.display.date,
      }
    }
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
    return this.api.dateToTimestamp(date);
  }

  public timestampPlusInterval(timestamp: number, interval: TimeInterval): number {
    this.ensureApi();
    return this.api.timestampPlusInterval(timestamp, interval);
  }
  
  public getNotesForDay(year: number, month: number, day: number): JournalEntry.ConfiguredInstance[] {
    this.ensureApi();
    const notes = this.api.getNotesForDay(year, month, day);
    
    return notes;
  }
  
  public async addNote(title: string, content: string, startDate: CalendarDate, endDate: CalendarDate, isPublic: boolean = true): Promise<JournalEntry.ConfiguredInstance> {
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
  
  public inject(html: JQuery<HTMLElement>, hidden: boolean): void {
    if (!hidden) {
      // turn off any existing calendar panels
      const existingPanels = $(`#${SimpleCalendarRebornAdapter.SC_ID_FOR_WINDOW_WRAPPER} .window-content`).find(`.${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_WRAPPER}.${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_EXTENDED}`);
      existingPanels.addClass(SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_CLOSED).removeClass(SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_EXTENDED);

      // if it's there we'll replace, otherwise we'll append
      if ($('#swr-fsc-container').length === 0) {
        // attach to the calendar
        const siblingPanels = $(`#${SimpleCalendarRebornAdapter.SC_ID_FOR_WINDOW_WRAPPER} .window-content`).find(`.${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_WRAPPER}.${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_CLOSED}`);
        siblingPanels.last().parent().append(html);
      } else {
        $('#swr-fsc-container').replaceWith(html);
      }
    } else {
      // hide it
      $('#swr-fsc-container').remove();
    }      
  }

  public activateListeners(hiddenCallback: (hidden: boolean) => void): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && $(mutation.target).hasClass(SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_EXTENDED) && 
            $(mutation.target).hasClass(SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_WRAPPER) && ((mutation.target as HTMLElement).id!='swr-fsc-container')) {
            // Class SC_CLASS_FOR_TAB_EXTENDED has been added to another panel (opening it), so turn off ours
            hiddenCallback(true);
            $('#swr-fsc-container').remove();
        }
      });
    });

    // attach the observer to the right element
    const element: JQuery<HTMLElement> | HTMLElement = $(`#${SimpleCalendarRebornAdapter.SC_ID_FOR_WINDOW_WRAPPER} .window-content`).find(`.${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_WRAPPER}`).last().parent();
    if (element && element.length>0) {
      const target = element.get(0);
      observer.observe(target as Node, { attributes: true, childList: true, subtree: true });
    }
  }

  public get containerClasses(): string {
    return `${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_WRAPPER} sc-right ${SimpleCalendarRebornAdapter.SC_CLASS_FOR_TAB_EXTENDED}`;  
  }

  public getHooks(): { init: string } {
    return {
      init: (globalThis as any).SimpleCalendar?.Hooks?.Init,
    };
  }
}
