import { ModuleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import { VersionUtils } from '@/utils/versionUtils';
import { isClientGM } from '@/utils/game';
import { ICalendarAdapter } from './ICalendarAdapter';
import { SimpleCalendarAdapter } from './SimpleCalendarAdapter';
import { SimpleCalendarRebornAdapter } from './SimpleCalendarRebornAdapter';
import { CalendariaAdapter } from './CalendariaAdapter';

export enum CalendarType {
  NONE = 'none',
  SIMPLE_CALENDAR = 'foundryvtt-simple-calendar',
  SIMPLE_CALENDAR_REBORN = 'foundryvtt-simple-calendar-reborn',
  CALENDARIA = 'calendaria'
}

export interface CalendarInfo {
  type: CalendarType;
  version?: string;
  isActive: boolean;
  meetsMinimumVersion: boolean;
}

export interface CalendarModuleInfo {
  moduleId: string;
  type: CalendarType;
  minimumVersion: string;
  preferredVersion?: string;
}

// these are sorted in order of preference (1st one found will win)
const CALENDAR_MODULES: CalendarModuleInfo[] = [
  {
    moduleId: 'calendaria',
    type: CalendarType.CALENDARIA,
    minimumVersion: '0.8.3',
    preferredVersion: '0.8.3'
  },
  {
    moduleId: 'foundryvtt-simple-calendar-reborn',
    type: CalendarType.SIMPLE_CALENDAR_REBORN,
    minimumVersion: '2.5.3',
    preferredVersion: '2.5.3'
  },
  {
    moduleId: 'foundryvtt-simple-calendar',
    type: CalendarType.SIMPLE_CALENDAR,
    minimumVersion: '2.4.18.5',  // this is the forked version
    preferredVersion: '2.4.18.5'
  }
];

export class CalendarManager {
  private static _instance: CalendarManager;
  private _currentCalendar: CalendarInfo;
  private _availableCalendars: CalendarInfo[] = [];
  private _hasMultipleCalendars = false;

  private constructor() {
    this._currentCalendar = {
      type: CalendarType.NONE,
      isActive: false,
      meetsMinimumVersion: false
    };
  }
  
  public static getInstance(): CalendarManager {
    if (!CalendarManager._instance) {
      CalendarManager._instance = new CalendarManager();
    }
    return CalendarManager._instance;
  }
  
  public detectAndSetCalendar(): void {
    // Reset current calendar
    this._currentCalendar = {
      type: CalendarType.NONE,
      isActive: false,
      meetsMinimumVersion: false
    };
    
    // First, detect all available calendars
    this.detectAllAvailableCalendars();
    
    // Check if more than one calendar is active
    if (this._availableCalendars.length > 1) {
      // Store that we have multiple calendars for later checking
      this._hasMultipleCalendars = true;
      // Don't set any calendar as current when multiple are found
      return;
    } else {
      this._hasMultipleCalendars = false;
    }
    
    // Check each calendar module in order
    for (const moduleInfo of CALENDAR_MODULES) {
      const module = game.modules?.get(moduleInfo.moduleId);
      
      if (module && module.active && module.version) {
        const meetsMinimumVersion = moduleInfo.minimumVersion === module.version || 
          VersionUtils.isMoreRecent(module.version, moduleInfo.minimumVersion);
        
        this._currentCalendar = {
          type: moduleInfo.type,
          version: module.version,
          isActive: true,
          meetsMinimumVersion
        };
        
        // Check for preferred version warnings
        if (meetsMinimumVersion && moduleInfo.preferredVersion && module.version !== moduleInfo.preferredVersion) {
          if (isClientGM()) {
            ui.notifications?.warn(
              `Simple Weather detected ${moduleInfo.moduleId} v${module.version}. ` +
              `Preferred version is v${moduleInfo.preferredVersion}. Some features may not work properly.`
            );
          }
        }
        
        // Found an active calendar, stop searching
        break;
      }
    }
    
    // Show warnings if no calendar is installed but settings require it
    if (!this._currentCalendar.isActive) {
      this.showNoCalendarWarnings();
    }
  }
  
  public get currentCalendar(): CalendarInfo {
    return this._currentCalendar;
  }
  
  public get hasActiveCalendar(): boolean {
    return this._currentCalendar.isActive && this._currentCalendar.meetsMinimumVersion;
  }
  
  public get hasMultipleCalendars(): boolean {
    return this._hasMultipleCalendars;
  }
  
  public get calendarType(): CalendarType {
    return this._currentCalendar.type;
  }
  
  public getAdapter(): ICalendarAdapter | null {
    switch (this._currentCalendar.type) {
      case CalendarType.CALENDARIA:
        return new CalendariaAdapter();

      case CalendarType.SIMPLE_CALENDAR:
        return new SimpleCalendarAdapter();

      case CalendarType.SIMPLE_CALENDAR_REBORN:
        return new SimpleCalendarRebornAdapter();

      case CalendarType.NONE:
      default:
        return null;
    }
  }

  /**
   * Detects all available calendar modules and returns their info
   * @returns Array of CalendarInfo for all installed and active calendar modules
   */
  public detectAllAvailableCalendars(): CalendarInfo[] {
    this._availableCalendars = [];

    for (const moduleInfo of CALENDAR_MODULES) {
      const module = game?.modules?.get(moduleInfo.moduleId);

      if (module && module.active && module.version) {
        const meetsMinimumVersion = moduleInfo.minimumVersion === module.version ||
          VersionUtils.isMoreRecent(module.version, moduleInfo.minimumVersion);

        this._availableCalendars.push({
          type: moduleInfo.type,
          version: module.version,
          isActive: true,
          meetsMinimumVersion
        });
      }
    }

    return this._availableCalendars;
  }

  /**
   * Gets the list of available calendars (requires detectAllAvailableCalendars to be called first)
   * @returns Array of available CalendarInfo objects
   */
  public getAvailableCalendars(): CalendarInfo[] {
    return this._availableCalendars;
  }

  /**
   * Manually sets which calendar module to use (useful for testing)
   * @param type The CalendarType to use
   * @param skipValidation If true, skips checking if the calendar is actually installed
   */
  public setCalendar(type: CalendarType, skipValidation: boolean = false): void {
    if (type === CalendarType.NONE) {
      this._currentCalendar = {
        type: CalendarType.NONE,
        isActive: false,
        meetsMinimumVersion: false
      };
      return;
    }

    if (!skipValidation) {
      // Ensure the calendar is available
      const available = this._availableCalendars.find(cal => cal.type === type);
      if (!available) {
        throw new Error(`Calendar type ${type} is not available. Call detectAllAvailableCalendars() first.`);
      }
      this._currentCalendar = available;
    } else {
      // For testing purposes, allow setting without validation
      const moduleInfo = CALENDAR_MODULES.find(m => m.type === type);
      if (!moduleInfo) {
        throw new Error(`Unknown calendar type: ${type}`);
      }

      const module = game?.modules?.get(moduleInfo.moduleId);
      const version = module?.version;
      const meetsMinimumVersion = version ?
        (moduleInfo.minimumVersion === version || VersionUtils.isMoreRecent(version, moduleInfo.minimumVersion)) :
        false;

      this._currentCalendar = {
        type,
        version,
        isActive: true,
        meetsMinimumVersion
      };
    }
  }

  private showNoCalendarWarnings(): void {
    if (!isClientGM()) return;
    
    if (ModuleSettings.get(ModuleSettingKeys.attachToCalendar)) {
      ui.notifications?.warn(
        `Simple Weather is set to "Attached Mode" in settings but no compatible calendar module is installed. ` +
        `This will keep it from displaying at all. You should turn off that setting if this isn't intended.`
      );
    }
    
    if (ModuleSettings.get(ModuleSettingKeys.useForecasts)) {
      ui.notifications?.error(
        'Simple Weather requires a compatible calendar module to generate forecasts. ' +
        'Please install and enable a supported calendar module or disable forecasts in the settings.'
      );
    }
    
    if (ModuleSettings.get(ModuleSettingKeys.outputDateToChat)) {
      ui.notifications?.error(
        'Simple Weather cannot output dates to chat without a compatible calendar module. ' +
        'Please install and enable a supported calendar module or disable "output date to chat" in the settings.'
      );
    }
  }
}

// Export a singleton instance for backward compatibility
export const calendarManager = CalendarManager.getInstance();
