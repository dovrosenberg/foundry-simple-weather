import { calendarManager, CalendarType } from '@/calendar/CalendarManager';
import { ICalendarAdapter, CalendarDate, TimeInterval } from '@/calendar/ICalendarAdapter';
import { Season } from '@/weather/climateData';
import { WeatherApplication } from '@/applications/WeatherApplication';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { runTestsForEachCalendar } from '@test/calendarTestHelper';
import { SimpleCalendarAdapter } from '@/calendar/SimpleCalendarAdapter';
import { SimpleCalendarRebornAdapter } from '@/calendar/SimpleCalendarRebornAdapter';
import { CalendariaAdapter } from '@/calendar/CalendariaAdapter';

// Mock global APIs for testing
const mockSimpleCalendarApi = {
  api: {
    timestamp: () => 1234567890,
    timestampToDate: (_ts: number) => ({
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
    dateToTimestamp: (_date: any) => 1234567890,
    timestampPlusInterval: (ts: number, interval: TimeInterval) => ts + (interval.day || 0) * 86400,
    getNotesForDay: () => [],
    addNote: async () => ({ id: 'test-note' } as any),
    removeNote: async () => {},
    addSidebarButton: (_title: string, _icon: string, _tooltip: string, _active: boolean, _onClick: () => void) => {},
  },
  Hooks: { Init: 'simple-calendar-init' }
};

const mockCalendariaApi = {
  api: {
    getCurrentDateTime: () => ({
      year: 2024,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      season: Season.Summer
    }),
    dateToTimestamp: (_date: any) => 1234567890,
    timestampToDate: (_ts: number) => ({
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
    formatDate: (_date: any, format: string) => {
      if (format === 'EEEE') return 'Friday';
      if (format === 'D MMMM YYYY') return '15 June 2024';
      if (format === 'D') return '15';
      if (format === 'MMMM') return 'June';
      if (format === 'YYYY') return '2024';
      return '15 June 2024';
    },
    getCurrentSeason: (_date: any) => ({ icon: 'fa-sun' })
  }
};

export const registerCalendarAdapterTests = () => {
  runTestsForEachCalendar(
    'simple-weather.calendar.adapters',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after } = context;
      let adapter: ICalendarAdapter | null;
      let originalSimpleCalendar: any;
      let originalCalendaria: any;

      before(() => {
        // Save original global APIs
        originalSimpleCalendar = (globalThis as any).SimpleCalendar;
        originalCalendaria = (globalThis as any).CALENDARIA;
        
        // Set up mock APIs based on current calendar type
        const currentType = calendarManager.calendarType;
        if (currentType === CalendarType.SIMPLE_CALENDAR || currentType === CalendarType.SIMPLE_CALENDAR_REBORN) {
          (globalThis as any).SimpleCalendar = mockSimpleCalendarApi ;
        } else if (currentType === CalendarType.CALENDARIA) {
          (globalThis as any).CALENDARIA = mockCalendariaApi ;
        }
        
        // Get the current adapter
        adapter = calendarManager.getAdapter();
      });

      after(() => {
        // Restore original global APIs
        (globalThis as any).SimpleCalendar = originalSimpleCalendar;
        (globalThis as any).CALENDARIA = originalCalendaria;
      });

      describe('Generic Adapter Functionality', () => {
        it('should have an adapter available', () => {
          expect(adapter).to.not.be.null;
        });

        it('should get current timestamp', () => {
          expect(adapter).to.not.be.null;
          const timestamp = adapter!.getCurrentTimestamp();
          expect(timestamp).to.equal(1234567890);
        });

        it('should convert timestamp to date', () => {
          expect(adapter).to.not.be.null;
          const date = adapter!.timestampToDate(1234567890);
          expect(date).to.not.be.null;
          expect(date!.year).to.equal(2024);
          expect(date!.month).to.equal(6);
          expect(date!.day).to.equal(15);
          expect(date!.hour).to.equal(14);
          expect(date!.minute).to.equal(30);
          expect(date!.season).to.equal(Season.Summer);
        });

        it('should convert date to timestamp', () => {
          expect(adapter).to.not.be.null;
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
          const timestamp = adapter!.dateToTimestamp(date);
          expect(timestamp).to.equal(1234567890);
        });

        it('should add interval to timestamp', () => {
          expect(adapter).to.not.be.null;
          const timestamp = adapter!.timestampPlusInterval(1234567890, { day: 1 });
          expect(timestamp).to.be.a('number');
        });

        it('should get notes for day', () => {
          expect(adapter).to.not.be.null;
          const notes = adapter!.getNotesForDay({ year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } });
          expect(notes).to.be.an('array');
        });

        it('should add note', async () => {
          expect(adapter).to.not.be.null;
          const startDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const endDate = { year: 2024, month: 6, day: 15, display: { date: '6/15/2024' } };
          const note = await adapter!.addNote('Test', 'Content', startDate, endDate);
          expect(note).to.have.property('id');
        });

        it('should remove note', async () => {
          expect(adapter).to.not.be.null;
          await expect(adapter!.removeNote('test-id')).to.not.throw;
        });

        it('should add sidebar button', () => {
          expect(adapter).to.not.be.null;
          const mockWeatherApp = { render: () => {}, toggleAttachModeHidden: () => {} } as WeatherApplication;
          expect(() => adapter!.addSidebarButton(mockWeatherApp, () => {})).to.not.throw;
        });

        it('should inject HTML', () => {
          expect(adapter).to.not.be.null;
          const mockHtml = $('<div id="test-container"></div>') as any;
          expect(() => adapter!.inject(mockHtml, false)).to.not.throw;
        });

        it('should activate listeners', () => {
          expect(adapter).to.not.be.null;
          expect(() => adapter!.activateListeners(() => {})).to.not.throw;
        });

        it('should return container classes', () => {
          expect(adapter).to.not.be.null;
          const classes = adapter!.containerClasses;
          expect(classes).to.be.a('string');
        });

        it('should return hooks', () => {
          expect(adapter).to.not.be.null;
          const hooks = adapter!.hooks;
          expect(hooks).to.have.property('init');
        });
      });
    }
  );
};

// Adapter-specific tests that test actual implementations
export const registerAdapterSpecificTests = () => {
  describe('simple-weather.calendar.adapters-specific', () => {
    const { describe, it, expect, before, after } = globalThis.quench as any;
    let originalSimpleCalendar: any;
    let originalCalendaria: any;

    before(() => {
      originalSimpleCalendar = (globalThis as any).SimpleCalendar;
      originalCalendaria = (globalThis as any).CALENDARIA;
    });

    after(() => {
      (globalThis as any).SimpleCalendar = originalSimpleCalendar;
      (globalThis as any).CALENDARIA = originalCalendaria;
    });

    describe('SimpleCalendarAdapter', () => {
      let adapter: SimpleCalendarAdapter;

      before(() => {
        (globalThis as any).SimpleCalendar = { 
          api: mockSimpleCalendarApi, 
          Hooks: { Init: 'simple-calendar-init' } 
        };
        adapter = new SimpleCalendarAdapter();
      });

      it('should have correct container classes', () => {
        const classes = adapter.containerClasses;
        expect(classes).to.include('fsc-of');
        expect(classes).to.include('sc-right');
        expect(classes).to.include('fsc-c');
      });

      it('should have correct hook', () => {
        const hooks = adapter.hooks;
        expect(hooks.init).to.equal('simple-calendar-init');
      });

      it('should have correct wrapper element ID', () => {
        expect(adapter.wrapperElementId).to.equal('swr-fsc-container');
      });
    });

    describe('SimpleCalendarRebornAdapter', () => {
      let adapter: SimpleCalendarRebornAdapter;

      before(() => {
        (globalThis as any).SimpleCalendar = { 
          api: mockSimpleCalendarApi, 
          Hooks: { Init: 'simple-calendar-reborn-init' } 
        };
        adapter = new SimpleCalendarRebornAdapter();
      });

      it('should have correct container classes', () => {
        const classes = adapter.containerClasses;
        expect(classes).to.include('fsc-of');
        expect(classes).to.include('sc-right');
        expect(classes).to.include('fsc-c');
      });

      it('should have correct hook', () => {
        const hooks = adapter.hooks;
        expect(hooks.init).to.equal('simple-calendar-reborn-init');
      });

      it('should have correct wrapper element ID', () => {
        expect(adapter.wrapperElementId).to.equal('swr-fsc-container');
      });
    });

    describe('CalendariaAdapter', () => {
      let adapter: CalendariaAdapter;

      before(() => {
        (globalThis as any).CALENDARIA = { api: mockCalendariaApi };
        adapter = new CalendariaAdapter();
      });

      it('should have empty container classes', () => {
        const classes = adapter.containerClasses;
        expect(classes).to.equal('');
      });

      it('should have correct hook', () => {
        const hooks = adapter.hooks;
        expect(hooks.init).to.equal('calendaria.ready');
      });

      it('should have correct wrapper element ID', () => {
        expect(adapter.wrapperElementId).to.equal('swr-calendaria-container');
      });
    });
  });
};
