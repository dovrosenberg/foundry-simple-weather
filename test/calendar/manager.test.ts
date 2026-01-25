import { CalendarManager, CalendarType, CalendarInfo } from '@/calendar/CalendarManager';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const registerCalendarManagerTests = () => {
  quench.registerBatch(
    'simple-weather.calendar.manager',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after, beforeEach } = context;

      describe('CalendarManager', () => {
        let manager: CalendarManager;
        let originalGame: any;

        before(() => {
          originalGame = (globalThis as any).game;
          manager = CalendarManager.getInstance();
        });

        after(() => {
          (globalThis as any).game = originalGame;
        });

        beforeEach(() => {
          // Reset calendar state before each test
          manager.setCalendar(CalendarType.NONE, true);
        });

        it('should be a singleton', () => {
          const manager1 = CalendarManager.getInstance();
          const manager2 = CalendarManager.getInstance();
          expect(manager1).to.equal(manager2);
        });

        it('should return null adapter when no calendar is set', () => {
          manager.setCalendar(CalendarType.NONE, true);
          const adapter = manager.getAdapter();
          expect(adapter).to.be.null;
        });

        it('should return SimpleCalendarAdapter when Simple Calendar is set', () => {
          manager.setCalendar(CalendarType.SIMPLE_CALENDAR, true);
          const adapter = manager.getAdapter();
          expect(adapter).to.not.be.null;
          expect(adapter!.name).to.equal('SimpleCalendarAdapter');
        });

        it('should return SimpleCalendarRebornAdapter when Simple Calendar Reborn is set', () => {
          manager.setCalendar(CalendarType.SIMPLE_CALENDAR_REBORN, true);
          const adapter = manager.getAdapter();
          expect(adapter).to.not.be.null;
          expect(adapter!.name).to.equal('SimpleCalendarRebornAdapter');
        });

        it('should return CalendariaAdapter when Calendaria is set', () => {
          manager.setCalendar(CalendarType.CALENDARIA, true);
          const adapter = manager.getAdapter();
          expect(adapter).to.not.be.null;
          expect(adapter!.name).to.equal('CalendariaAdapter');
        });

        it('should detect available calendars', () => {
          // Mock game.modules with some calendar modules
          (globalThis as any).game = {
            modules: {
              get: (moduleId: string) => {
                if (moduleId === 'foundryvtt-simple-calendar') {
                  return {
                    active: true,
                    version: '2.4.18.5'
                  };
                }
                if (moduleId === 'calendaria') {
                  return {
                    active: true,
                    version: '0.7.1'
                  };
                }
                return undefined;
              }
            }
          };

          const available = manager.detectAllAvailableCalendars();
          expect(available).to.be.an('array');
          expect(available.length).to.be.greaterThan(0);
        });

        it('should handle no available calendars', () => {
          // Mock game.modules with no calendar modules
          (globalThis as any).game = {
            modules: {
              get: () => undefined
            }
          };

          const available = manager.detectAllAvailableCalendars();
          expect(available).to.be.an('array');
          expect(available.length).to.equal(0);
        });

        it('should get current calendar info', () => {
          manager.setCalendar(CalendarType.SIMPLE_CALENDAR, true);
          const current = manager.currentCalendar;
          expect(current.type).to.equal(CalendarType.SIMPLE_CALENDAR);
          expect(current.isActive).to.be.true;
        });

        it('should check if has active calendar', () => {
          manager.setCalendar(CalendarType.NONE, true);
          expect(manager.hasActiveCalendar).to.be.false;

          manager.setCalendar(CalendarType.SIMPLE_CALENDAR, true);
          expect(manager.hasActiveCalendar).to.be.true;
        });

        it('should get calendar type', () => {
          manager.setCalendar(CalendarType.CALENDARIA, true);
          expect(manager.calendarType).to.equal(CalendarType.CALENDARIA);
        });

        it('should detect multiple calendars', () => {
          // Mock game.modules with multiple active calendars
          (globalThis as any).game = {
            modules: {
              get: (moduleId: string) => {
                if (moduleId === 'foundryvtt-simple-calendar') {
                  return {
                    active: true,
                    version: '2.4.18.5'
                  };
                }
                if (moduleId === 'calendaria') {
                  return {
                    active: true,
                    version: '0.7.1'
                  };
                }
                return undefined;
              }
            }
          };

          manager.detectAndSetCalendar();
          expect(manager.hasMultipleCalendars).to.be.true;
          expect(manager.currentCalendar.type).to.equal(CalendarType.NONE);
        });

        it('should set calendar with validation', () => {
          // First detect some calendars
          (globalThis as any).game = {
            modules: {
              get: (moduleId: string) => {
                if (moduleId === 'foundryvtt-simple-calendar') {
                  return {
                    active: true,
                    version: '2.4.18.5'
                  };
                }
                return undefined;
              }
            }
          };

          manager.detectAllAvailableCalendars();
          
          // This should work
          expect(() => {
            manager.setCalendar(CalendarType.SIMPLE_CALENDAR, false);
          }).to.not.throw();

          // This should fail because calendar isn't available
          expect(() => {
            manager.setCalendar(CalendarType.CALENDARIA, false);
          }).to.throw();
        });

        it('should set calendar without validation (for testing)', () => {
          expect(() => {
            manager.setCalendar(CalendarType.SIMPLE_CALENDAR, true);
          }).to.not.throw();
        });

        it('should throw error for unknown calendar type', () => {
          expect(() => {
            manager.setCalendar('unknown' as CalendarType, true);
          }).to.throw('Unknown calendar type');
        });

        it('should handle detectAndSetCalendar with no calendars', () => {
          // Mock no calendars available
          (globalThis as any).game = {
            modules: {
              get: () => undefined
            }
          };

          expect(() => {
            manager.detectAndSetCalendar();
          }).to.not.throw();

          expect(manager.currentCalendar.type).to.equal(CalendarType.NONE);
          expect(manager.hasActiveCalendar).to.be.false;
        });

        it('should get available calendars after detection', () => {
          // Mock some calendars
          (globalThis as any).game = {
            modules: {
              get: (moduleId: string) => {
                if (moduleId === 'foundryvtt-simple-calendar') {
                  return {
                    active: true,
                    version: '2.4.18.5'
                  };
                }
                return undefined;
              }
            }
          };

          manager.detectAllAvailableCalendars();
          const available = manager.getAvailableCalendars();
          expect(available).to.be.an('array');
          expect(available.length).to.be.greaterThan(0);
        });

        it('should handle version comparison correctly', () => {
          // Mock calendar with newer version
          (globalThis as any).game = {
            modules: {
              get: (moduleId: string) => {
                if (moduleId === 'foundryvtt-simple-calendar') {
                  return {
                    active: true,
                    version: '2.5.0.0' // Newer than minimum
                  };
                }
                return undefined;
              }
            }
          };

          manager.detectAndSetCalendar();
          expect(manager.currentCalendar.meetsMinimumVersion).to.be.true;
        });

        it('should handle version below minimum', () => {
          // Mock calendar with older version
          (globalThis as any).game = {
            modules: {
              get: (moduleId: string) => {
                if (moduleId === 'foundryvtt-simple-calendar') {
                  return {
                    active: true,
                    version: '2.4.0.0' // Older than minimum
                  };
                }
                return undefined;
              }
            }
          };

          manager.detectAndSetCalendar();
          expect(manager.currentCalendar.meetsMinimumVersion).to.be.false;
        });
      });
    }
  );
};
