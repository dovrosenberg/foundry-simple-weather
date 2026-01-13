# Simple Weather Startup Flow and Calendar Detection

## Overview
Simple Weather uses a multi-stage startup process to detect and integrate with calendar modules. The system is designed to support multiple calendar types through an abstraction layer.

## Startup Order

### 1. Module Initialization (Init Phase)
```
Hooks.once('init', () => {
  // Module registration and basic setup
  // No calendar operations yet - calendars may not be loaded
})
```

### 2. Dependency Checking (Ready Phase)
```typescript
Hooks.once('ready', async () => {
  checkDependencies();  // ← Calendar detection happens here
  await migrateData();
  
  if (!calendarManager.hasActiveCalendar) {
    // No calendar - initialize sounds and mark as ready
    await initSounds();
    weatherApplication.ready();
  }
})
```

### 3. Calendar Integration (Setup Phase)
```typescript
Hooks.once('setup', () => {
  const calendarAdapter = getCalendarAdapter();
  
  if (calendarAdapter && 'SimpleCalendar' in globalThis) {
    const hooks = calendarAdapter.getHooks();
    
    Hooks.once(hooks.init, async () => {
      if (calendarManager.hasActiveCalendar) {
        weatherApplication.simpleCalendarInstalled();
        weatherApplication.activateCalendar();
        weatherApplication.updateDateTime(/*...*/);
        await initSounds();
        weatherApplication.ready();
      }
    });
    
    Hooks.on(hooks.dateTimeChange, (timestamp) => {
      if (calendarManager.hasActiveCalendar) {
        weatherApplication.updateDateTime(/*...*/);
      }
    });
  }
})
```

### 4. UI Integration (Render Phase)
```typescript
Hooks.on('renderSimpleCalendar', (html) => {
  // Add Simple Weather button to calendar UI
  // Handles both compact and normal modes
})
```

## Calendar Detection Process

### 1. Calendar Manager
The `CalendarManager` class is the central authority for calendar detection:

```typescript
// Singleton instance
export const calendarManager = new CalendarManager();

// Detection method
public detectAndSetCalendar(): void {
  // Checks modules in preference order
  for (const moduleInfo of CALENDAR_MODULES) {
    const module = game?.modules?.get(moduleInfo.moduleId);
    
    if (module && module.active && module.version) {
      const meetsMinimumVersion = /* version check */;
      
      this._currentCalendar = {
        type: moduleInfo.type,
        version: module.version,
        isActive: true,
        meetsMinimumVersion
      };
      break; // First matching module wins
    }
  }
}
```

### 2. Module Preference Order
```typescript
const CALENDAR_MODULES: CalendarModuleInfo[] = [
  // 1st priority: Simple Calendar Reborn
  {
    moduleId: 'foundryvtt-simple-calendar-reborn',
    type: CalendarType.SIMPLE_CALENDAR_REBORN,
    minimumVersion: '2.5.3',
    preferredVersion: '2.5.3'
  },
  // 2nd priority: Original Simple Calendar
  {
    moduleId: 'foundryvtt-simple-calendar',
    type: CalendarType.SIMPLE_CALENDAR,
    minimumVersion: '2.4.18.5',
    preferredVersion: '2.4.18.5'
  }
];
```

### 3. Global State Tracking
```typescript
// All calendar state is now centralized in CalendarManager
// No global variables - everything accessed through the singleton

// Example usage throughout the app:
calendarManager.calendarType        // Returns the active CalendarType enum
calendarManager.hasActiveCalendar      // Returns true if any calendar is active
calendarManager.currentCalendar     // Returns full CalendarInfo object
```

## Data Structures

### CalendarType Enum
```typescript
export enum CalendarType {
  NONE = 'none',
  SIMPLE_CALENDAR = 'foundryvtt-simple-calendar',
  SIMPLE_CALENDAR_REBORN = 'foundryvtt-simple-calendar-reborn'
}
```

### CalendarInfo Interface
```typescript
export interface CalendarInfo {
  type: CalendarType;
  version?: string;
  isActive: boolean;
  meetsMinimumVersion: boolean;
}
```

### CalendarModuleInfo Interface
```typescript
export interface CalendarModuleInfo {
  moduleId: string;
  type: CalendarType;
  minimumVersion: string;
  preferredVersion?: string;
}
```

## Adapter Pattern

### ICalendarAdapter Interface
Standardizes calendar operations across different modules:
```typescript
export interface ICalendarAdapter {
  // Date/Time operations
  getCurrentTimestamp(): number;
  timestampToDate(timestamp: number): SimpleCalendarDate;
  timestampPlusInterval(timestamp: number, interval: TimeInterval): number;
  
  // Note management
  getNotesForDay(year: number, month: number, day: number): Promise<JournalEntry[]>;
  addNote(title: string, content: string, startDate: any, endDate: any, isAllDay: boolean): Promise<any>;
  removeNote(noteId: string): Promise<void>;
  
  // UI integration
  addSidebarButton(name: string, icon: string, iconClass: string, isPrimary: boolean, onClick: () => void): void;
  
  // Hooks
  getHooks(): { init: string; dateTimeChange: string };
}
```

### CalendarManager API
The CalendarManager provides all necessary methods:

```typescript
// Get the adapter for the active calendar
const adapter = calendarManager.getAdapter();

// Check calendar status
calendarManager.hasActiveCalendar: boolean
calendarManager.calendarType: CalendarType
calendarManager.currentCalendar: CalendarInfo

// Detect and set the active calendar
calendarManager.detectAndSetCalendar(): void
```

## Key Points

1. **Centralized Management**: All calendar state is managed by the CalendarManager singleton
2. **Preference Order**: Simple Calendar Reborn is checked first, then original Simple Calendar
3. **Version Validation**: Each module must meet minimum version requirements
4. **Graceful Degradation**: System works without any calendar (limited features)
5. **Backward Compatibility**: Maintains `simpleCalendarInstalled()` method for legacy code
6. **Abstraction**: All calendar operations go through the adapter interface
7. **Hook Integration**: Listens for calendar-specific hooks for date/time changes
8. **No Global Variables**: Calendar state accessed only through CalendarManager methods

## Debug Information

The debug output shows:
```typescript
activeCalendarType: foundryvtt-simple-calendar-reborn  // or NONE, or foundryvtt-simple-calendar
Calendar: foundryvtt-simple-calendar-reborn             // From calendarManager
Calendar version: 2.5.3                                // Actual version detected
```

## Extension Points

To add a new calendar module:
1. Add to `CALENDAR_MODULES` array in CalendarManager.ts
2. Create new adapter class implementing `ICalendarAdapter`
3. Add case in `CalendarManager.getAdapter()` method
4. Export from calendar/index.ts

The system is designed to be easily extensible while maintaining backward compatibility and clear separation of concerns.
