import { calendarManager, CalendarType } from '@/calendar/CalendarManager';
import { ICalendarAdapter, CalendarDate, TimeInterval } from '@/calendar/ICalendarAdapter';
import { Season } from '@/weather/climateData';
import { WeatherApplication } from '@/applications/WeatherApplication';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { runTestsForEachCalendar } from '@test/calendarTestHelper';
import { SimpleCalendarAdapter } from '@/calendar/SimpleCalendarAdapter';
import { SimpleCalendarRebornAdapter } from '@/calendar/SimpleCalendarRebornAdapter';
import { CalendariaAdapter } from '@/calendar/CalendariaAdapter';

// Test date constants for use across all adapter tests
const TEST_DATES: CalendarDate[] = [
  {
    year: 2024,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
    season: Season.Summer,
    weekday: 'Monday',
    display: {
      weekday: 'Monday',
      date: 'June 15, 2024',
      day: '15',
      month: 'June',
      year: '2024',
      time: '14:30'
    }
  },
  {
    year: 2023,
    month: 0,
    day: 1,
    hour: 0,
    minute: 0,
    season: Season.Winter,
    weekday: 'Tuesday',
    display: { 
      weekday: 'Tuesday',
      date: 'January 1, 2023',
      day: '1',
      month: 'January',
      year: '2023',
      time: '00:00' 
    }
  },
  {
    year: 2025,
    month: 11,
    day: 31,
    hour: 23,
    minute: 59,
    season: Season.Winter,
    weekday: 'Wednesday',
    display: { 
      weekday: 'Wednesday',
      date: 'December 31, 2025',
      day: '31',
      month: 'December',
      year: '2025',
      time: '23:59'
    }
  },
  {
    year: 2024,
    month: 3,
    day: 10,
    hour: 12,
    minute: 0,
    season: Season.Spring,
    weekday: 'Thursday',
    display: {
      weekday: 'Thursday',
      date: 'April 10, 2024',
      day: '10',
      month: 'April',
      year: '2024',
      time: '12:00'
    }
  },
  {
    year: 2024,
    month: 9,
    day: 20,
    hour: 8,
    minute: 45,
    season: Season.Fall,
    weekday: 'Friday',
    display: {
      weekday: 'Friday',
      date: 'October 20, 2024',
      day: '20',
      month: 'October',
      year: '2024',
      time: '08:45'
    }
  }
];

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
      let adapter: ICalendarAdapter<any> | null;
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
          const date = TEST_DATES[0];
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
          const notes = adapter!.getNotesForDay(TEST_DATES[0]);
          expect(notes).to.be.an('array');
        });

        it('should add note', async () => {
          expect(adapter).to.not.be.null;
          const startDate = TEST_DATES[0];
          const endDate = TEST_DATES[0];
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

      describe('Date Conversion Methods', () => {
        it('should handle date conversion roundtrip correctly', () => {
          TEST_DATES.forEach(originalCalendarDate => {
            const apiDate = adapter.CalendarDateToAPIDate(originalCalendarDate);
            const convertedBack = adapter.APIDateToCalendarDate(apiDate);

            // check every property of the CalendarDate object
            expect(convertedBack.year).to.equal(originalCalendarDate.year);
            expect(convertedBack.month).to.equal(originalCalendarDate.month);
            expect(convertedBack.day).to.equal(originalCalendarDate.day);
            expect(convertedBack.hour).to.equal(originalCalendarDate.hour);
            expect(convertedBack.minute).to.equal(originalCalendarDate.minute);
            expect(convertedBack.season).to.equal(originalCalendarDate.season);
            expect(convertedBack.weekday).to.equal(originalCalendarDate.weekday);            
            expect(convertedBack.display).to.deep.equal(originalCalendarDate.display);
          });
        });
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

      describe('Date Conversion Methods', () => {
        it('should handle date conversion roundtrip correctly', () => {
          TEST_DATES.forEach(originalCalendarDate => {
            const apiDate = adapter.CalendarDateToAPIDate(originalCalendarDate);
            const convertedBack = adapter.APIDateToCalendarDate(apiDate);

            // check every property of the CalendarDate object
            expect(convertedBack.year).to.equal(originalCalendarDate.year);
            expect(convertedBack.month).to.equal(originalCalendarDate.month);
            expect(convertedBack.day).to.equal(originalCalendarDate.day);
            expect(convertedBack.hour).to.equal(originalCalendarDate.hour);
            expect(convertedBack.minute).to.equal(originalCalendarDate.minute);
            expect(convertedBack.season).to.equal(originalCalendarDate.season);
            expect(convertedBack.weekday).to.equal(originalCalendarDate.weekday);            
            expect(convertedBack.display).to.deep.equal(originalCalendarDate.display);
          });
        });
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

      describe('Date Conversion Methods', () => {
        it('should handle date conversion roundtrip correctly', () => {
          TEST_DATES.forEach(originalCalendarDate => {
            const apiDate = adapter.CalendarDateToAPIDate(originalCalendarDate);
            const convertedBack = adapter.APIDateToCalendarDate(apiDate);

            // check every property of the CalendarDate object
            expect(convertedBack.year).to.equal(originalCalendarDate.year);
            expect(convertedBack.month).to.equal(originalCalendarDate.month);
            expect(convertedBack.day).to.equal(originalCalendarDate.day);
            expect(convertedBack.hour).to.equal(originalCalendarDate.hour);
            expect(convertedBack.minute).to.equal(originalCalendarDate.minute);
            expect(convertedBack.season).to.equal(originalCalendarDate.season);
            expect(convertedBack.weekday).to.equal(originalCalendarDate.weekday);            
            expect(convertedBack.display).to.deep.equal(originalCalendarDate.display);
          });
        });
      });
    });
  });
};
