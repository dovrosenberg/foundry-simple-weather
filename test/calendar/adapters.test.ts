import { SimpleCalendarAdapter } from '@/calendar/SimpleCalendarAdapter';
import { CalendariaAdapter } from '@/calendar/CalendariaAdapter';
import { SimpleCalendarRebornAdapter } from '@/calendar/SimpleCalendarRebornAdapter';
import { CalendarDate, TimeInterval } from '@/calendar/ICalendarAdapter';
import { Season } from '@/weather/climateData';
import { WeatherApplication } from '@/applications/WeatherApplication';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { runTestsForEachCalendar } from '@test/calendarTestHelper';

// Mock global APIs for testing
const mockSimpleCalendarApi = {
  timestamp: () => 1234567890,
  timestampToDate: (ts: number) => ({
    year: 2024,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
    currentSeason: { icon: 'summer' },
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dayOfTheWeek: 4,
    display: {
      weekday: 'Friday',
      month: 'June',
      day: '15',
      year: '2024',
      time: '14:30',
      date: '6/15/2024'
    }
  }),
  dateToTimestamp: (date: any) => 1234567890,
  timestampPlusInterval: (ts: number, interval: TimeInterval) => ts + (interval.day || 0) * 86400,
  getNotesForDay: () => [],
  addNote: async () => ({ id: 'test-note' } as any),
  removeNote: async () => {},
  addSidebarButton: (title: string, icon: string, tooltip: string, active: boolean, onClick: () => void) => {},
  Hooks: { Init: 'simple-calendar.init' }
};

const mockCalendariaApi = {
  getCurrentDateTime: () => ({
    year: 2024,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
    season: Season.Summer
  }),
  dateToTimestamp: (date: any) => 1234567890,
  timestampToDate: (ts: number) => ({
    year: 2024,
    month: 6,
    dayOfMonth: 15,
    hour: 14,
    minute: 30,
    season: Season.Summer,
    dayOfWeek: 4
  }),
  addYears: (date: any, years: number) => ({ ...date, year: date.year + years }),
  addMonths: (date: any, months: number) => ({ ...date, month: date.month + months }),
  addDays: (date: any, days: number) => ({ ...date, dayOfMonth: date.dayOfMonth + days }),
  getNotesForDate: () => [],
  createNote: async () => ({ id: 'test-note' } as any),
  deleteNote: async () => {},
  registerWidget: () => {},
  formatDate: (date: any, format: string) => {
    if (format === 'EEEE') return 'Friday';
    if (format === 'D MMMM YYYY') return '15 June 2024';
    if (format === 'D') return '15';
    if (format === 'MMMM') return 'June';
    if (format === 'YYYY') return '2024';
    return '15 June 2024';
  },
  getCurrentSeason: (date: any) => ({ icon: 'fa-sun' })
};

export const registerCalendarAdapterTests = () => {
  runTestsForEachCalendar(
    'simple-weather.calendar.adapters',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after } = context;

      describe('SimpleCalendarAdapter', () => {
        let adapter: SimpleCalendarAdapter;
        let originalSimpleCalendar: any;

        before(() => {
          originalSimpleCalendar = (globalThis as any).SimpleCalendar;
          (globalThis as any).SimpleCalendar = { api: mockSimpleCalendarApi };
          adapter = new SimpleCalendarAdapter();
        });

        after(() => {
          (globalThis as any).SimpleCalendar = originalSimpleCalendar;
        });

        it('should get current timestamp', () => {
          const timestamp = adapter.getCurrentTimestamp();
          expect(timestamp).to.equal(1234567890);
        });

        it('should convert timestamp to date', () => {
          const date = adapter.timestampToDate(1234567890);
          expect(date).to.not.be.null;
          expect(date!.year).to.equal(2024);
          expect(date!.month).to.equal(6);
          expect(date!.day).to.equal(15);
          expect(date!.hour).to.equal(14);
          expect(date!.minute).to.equal(30);
          expect(date!.season).to.equal(Season.Summer);
          expect(date!.weekday).to.equal('Fri');
          expect(date!.display.weekday).to.equal('Friday');
          expect(date!.display.month).to.equal('June');
        });

        it('should convert date to timestamp', () => {
          const date: CalendarDate = {
            year: 2024,
            month: 6,
            day: 15,
            hour: 14,
            minute: 30,
            display: {
              date: '6/15/2024'
            }
          };
          const timestamp = adapter.dateToTimestamp(date);
          expect(timestamp).to.equal(1234567890);
        });

        it('should add interval to timestamp', () => {
          const timestamp = adapter.timestampPlusInterval(1234567890, { day: 1 });
          expect(timestamp).to.equal(1234567890 + 86400);
        });

        it('should get notes for day', () => {
          const notes = adapter.getNotesForDay(2024, 6, 15);
          expect(notes).to.be.an('array');
        });

        it('should add note', async () => {
          const startDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const endDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const note = await adapter.addNote('Test', 'Content', startDate, endDate);
          expect(note).to.have.property('id');
        });

        it('should remove note', async () => {
          await expect(adapter.removeNote('test-id')).to.not.throw;
        });

        it('should add sidebar button', () => {
          const mockWeatherApp = { render: () => {}, toggleAttachModeHidden: () => {} } as WeatherApplication;
          expect(() => adapter.addSidebarButton(mockWeatherApp, () => {})).to.not.throw;
        });

        it('should inject HTML', () => {
          const mockHtml = $('<div id="test-container"></div>') as any;
          expect(() => adapter.inject(mockHtml, false)).to.not.throw;
        });

        it('should activate listeners', () => {
          expect(() => adapter.activateListeners(() => {})).to.not.throw;
        });

        it('should return container classes', () => {
          const classes = adapter.containerClasses;
          expect(classes).to.be.a('string');
          expect(classes).to.include('fsc-of');
          expect(classes).to.include('sc-right');
          expect(classes).to.include('fsc-c');
        });

        it('should return hooks', () => {
          const hooks = adapter.getHooks();
          expect(hooks).to.have.property('init');
          expect(hooks.init).to.equal('simple-calendar.init');
        });

        it('should throw error when API not available', () => {
          (globalThis as any).SimpleCalendar = undefined;
          const badAdapter = new SimpleCalendarAdapter();
          expect(() => badAdapter.getCurrentTimestamp()).to.throw('Simple Calendar API not available');
        });
      });

      describe('SimpleCalendarRebornAdapter', () => {
        let adapter: SimpleCalendarRebornAdapter;
        let originalSimpleCalendar: any;

        before(() => {
          originalSimpleCalendar = (globalThis as any).SimpleCalendar;
          (globalThis as any).SimpleCalendar = { api: mockSimpleCalendarApi };
          adapter = new SimpleCalendarRebornAdapter();
        });

        after(() => {
          (globalThis as any).SimpleCalendar = originalSimpleCalendar;
        });

        it('should get current timestamp', () => {
          const timestamp = adapter.getCurrentTimestamp();
          expect(timestamp).to.equal(1234567890);
        });

        it('should convert timestamp to date', () => {
          const date = adapter.timestampToDate(1234567890);
          expect(date).to.not.be.null;
          expect(date!.year).to.equal(2024);
          expect(date!.month).to.equal(6);
          expect(date!.day).to.equal(15);
        });

        it('should convert date to timestamp', () => {
          const date: CalendarDate = {
            year: 2024,
            month: 6,
            day: 15,
            hour: 14,
            minute: 30,
            display: {
              date: '6/15/2024'
            }
          };
          const timestamp = adapter.dateToTimestamp(date);
          expect(timestamp).to.equal(1234567890);
        });

        it('should add interval to timestamp', () => {
          const timestamp = adapter.timestampPlusInterval(1234567890, { day: 1 });
          expect(timestamp).to.equal(1234567890 + 86400);
        });

        it('should get notes for day', () => {
          const notes = adapter.getNotesForDay(2024, 6, 15);
          expect(notes).to.be.an('array');
        });

        it('should add note', async () => {
          const startDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const endDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const note = await adapter.addNote('Test', 'Content', startDate, endDate);
          expect(note).to.have.property('id');
        });

        it('should remove note', async () => {
          await expect(adapter.removeNote('test-id')).to.not.throw;
        });

        it('should add sidebar button', () => {
          const mockWeatherApp = { render: () => {}, toggleAttachModeHidden: () => {} } as WeatherApplication;
          expect(() => adapter.addSidebarButton(mockWeatherApp, () => {})).to.not.throw;
        });

        it('should inject HTML', () => {
          const mockHtml = $('<div id="test-container"></div>') as any;
          expect(() => adapter.inject(mockHtml, false)).to.not.throw;
        });

        it('should activate listeners', () => {
          expect(() => adapter.activateListeners(() => {})).to.not.throw;
        });

        it('should return container classes', () => {
          const classes = adapter.containerClasses;
          expect(classes).to.be.a('string');
          expect(classes).to.include('fsc-of');
          expect(classes).to.include('sc-right');
          expect(classes).to.include('fsc-c');
        });

        it('should return hooks', () => {
          const hooks = adapter.getHooks();
          expect(hooks).to.have.property('init');
          expect(hooks.init).to.equal('simple-calendar.init');
        });

        it('should throw error when API not available', () => {
          (globalThis as any).SimpleCalendar = undefined;
          const badAdapter = new SimpleCalendarRebornAdapter();
          expect(() => badAdapter.getCurrentTimestamp()).to.throw('Simple Calendar Reborn API not available');
        });
      });

      describe('CalendariaAdapter', () => {
        let adapter: CalendariaAdapter;
        let originalCalendaria: any;

        before(() => {
          originalCalendaria = (globalThis as any).CALENDARIA;
          (globalThis as any).CALENDARIA = { api: mockCalendariaApi };
          adapter = new CalendariaAdapter();
        });

        after(() => {
          (globalThis as any).CALENDARIA = originalCalendaria;
        });

        it('should get current timestamp', () => {
          const timestamp = adapter.getCurrentTimestamp();
          expect(timestamp).to.equal(1234567890);
        });

        it('should convert timestamp to date', () => {
          const date = adapter.timestampToDate(1234567890);
          expect(date).to.not.be.null;
          expect(date!.year).to.equal(2024);
          expect(date!.month).to.equal(6);
          expect(date!.day).to.equal(15);
          expect(date!.hour).to.equal(14);
          expect(date!.minute).to.equal(30);
          expect(date!.season).to.equal(Season.Summer);
          expect(date!.display.weekday).to.equal('Friday');
          expect(date!.display.date).to.equal('15 June 2024');
        });

        it('should convert date to timestamp', () => {
          const date: CalendarDate = {
            year: 2024,
            month: 6,
            day: 15,
            hour: 14,
            minute: 30,
            display: {
              date: '6/15/2024'
            }
          };
          const timestamp = adapter.dateToTimestamp(date);
          expect(timestamp).to.equal(1234567890);
        });

        it('should add interval to timestamp', () => {
          const timestamp = adapter.timestampPlusInterval(1234567890, { day: 1 });
          expect(timestamp).to.be.a('number');
        });

        it('should get notes for day', () => {
          const notes = adapter.getNotesForDay(2024, 6, 15);
          expect(notes).to.be.an('array');
        });

        it('should add note', async () => {
          const startDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const endDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const note = await adapter.addNote('Test', 'Content', startDate, endDate);
          expect(note).to.have.property('id');
        });

        it('should remove note', async () => {
          await expect(adapter.removeNote('test-id')).to.not.throw;
        });

        it('should add sidebar button', () => {
          const mockWeatherApp = { render: () => {}, toggleAttachModeHidden: () => {} } as WeatherApplication;
          expect(() => adapter.addSidebarButton(mockWeatherApp, () => {})).to.not.throw;
        });

        it('should inject HTML', () => {
          const mockHtml = $('<div id="test-container"></div>') as any;
          expect(() => adapter.inject(mockHtml, false)).to.not.throw;
        });

        it('should activate listeners', () => {
          expect(() => adapter.activateListeners(() => {})).to.not.throw;
        });

        it('should return container classes', () => {
          const classes = adapter.containerClasses;
          expect(classes).to.be.a('string');
          expect(classes).to.equal('');
        });

        it('should return hooks', () => {
          const hooks = adapter.getHooks();
          expect(hooks).to.have.property('init');
          expect(hooks.init).to.equal('calendaria.ready');
        });

        it('should throw error when API not available', () => {
          (globalThis as any).CALENDARIA = undefined;
          const badAdapter = new CalendariaAdapter();
          expect(() => badAdapter.getCurrentTimestamp()).to.throw('Calendaria API not available');
        });

        it('should handle season mapping correctly', () => {
          const mockDate = {
            year: 2024,
            month: 12,
            day: 20,
            dayOfMonth: 20,
            hour: 10,
            minute: 0,
            season: Season.Winter,
            dayOfWeek: 5,
            leapYear: false,
            second: 0
          };
          
          mockCalendariaApi.getCurrentSeason = () => ({ icon: 'fa-snowflake' });
          const date = adapter.APIDateToCalendarDate(mockDate);
          expect(date.season).to.equal(Season.Winter);
        });
      });
    }
  );
};
