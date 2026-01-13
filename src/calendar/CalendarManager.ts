import { ModuleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import { VersionUtils } from '@/utils/versionUtils';
import { isClientGM } from '@/utils/game';
import { ICalendarAdapter } from './ICalendarAdapter';
import { SimpleCalendarAdapter } from './SimpleCalendarAdapter';
import { SimpleCalendarRebornAdapter } from './SimpleCalendarRebornAdapter';

export enum CalendarType {
  NONE = 'none',
  SIMPLE_CALENDAR = 'foundryvtt-simple-calendar',
  SIMPLE_CALENDAR_REBORN = 'foundryvtt-simple-calendar-reborn'
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
    
    // Check each calendar module in order
    for (const moduleInfo of CALENDAR_MODULES) {
      const module = game?.modules?.get(moduleInfo.moduleId);
      
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
  
  public get calendarType(): CalendarType {
    return this._currentCalendar.type;
  }
  
  public getAdapter(): ICalendarAdapter | null {
    switch (this._currentCalendar.type) {
      case CalendarType.SIMPLE_CALENDAR:
        return new SimpleCalendarAdapter();
      
      case CalendarType.SIMPLE_CALENDAR_REBORN:
        return new SimpleCalendarRebornAdapter();
      
      case CalendarType.NONE:
      default:
        return null;
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
