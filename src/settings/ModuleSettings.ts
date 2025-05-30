import moduleJson from '@module';

import { WindowPosition } from '@/window/WindowPosition';
import { isClientGM, localize } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';
import { DisplayOptions } from '@/types/DisplayOptions';
import { CustomMessageSettingsApplication } from '@/applications/CustomMessageSettingsApplication';
import { Climate, Humidity } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';

export enum ModuleSettingKeys {
  // displayed in settings
  // GM only
  dialogDisplay = 'dialogDisplay',   // can non-GM clients see the dialog box
  outputWeatherToChat = 'outputWeatherChat',   // when new weather is generated, should it be put in the chat box
  outputDateToChat = 'outputDateToChat',   // should we include the date in chat posts?
  publicChat = 'publicChat',   // should everyone see the chat (true) or just the GM (false)
  useFX = 'useFX',  // the name of the package used for FX (or 'off' if none)
  FXByScene = 'FXByScene',  // should we use FX by scene or by module
  attachToCalendar = 'attachToCalendar',  // should we attach to simple calendar instead of standalone window
  storeInSCNotes = 'storeInSCNotes',   // should we store weather in simple calendar notes 
  useForecasts = 'useForecasts',   // should we generate and display forecasts?

  // players can set
  useCelsius = 'useCelsius',   // should we use Celsius
  playSound = 'playSound',   // should we play sounds when showing effects?
  // normalizeVolume = 'normalizeVolume',   // should we normalize the volume level across all clips?
  soundVolume = 'soundVolume',   // volume level for sounds

  // internal only
  fxActive = 'fxActive',   // are the fx currently showing
  activeFXMParticleEffects = 'activeFXMParticleEffects',     // the list of active fx particle effects; need to save because FXMaster saves them
  activeFXMFilterEffects = 'activeFXMFilterEffects',     // the list of active fx filter effects; need to save because FXMaster saves them
  windowPosition = 'windowPosition',   // the current position of the window
  displayOptions = 'displayOptions',  // how is the application window configured
  lastWeatherData = 'lastWeatherData',  // the previously generated weather data
  season = 'season',   // the current season
  seasonSync = 'seasonSync',       // should we sync with simple calendar
  biome = 'biome',  // the current biome
  climate = 'climate',   // the current climate
  humidity = 'humidity',   // the current humidity
  manualPause = 'manualPause',   // is the manual pause currently active (will prevent any auto or regen updates)
  customChatMessages = 'customChatMessages',  // [climate][humidity][index]: message
  forecasts = 'forecasts',   // a map from the timestamp for a day to a Forecast object for that day
  previousVersion = 'previousVersion',   // the previous version of the module - checked in init() to determine if any data migration is needed
}

type SettingType<K extends ModuleSettingKeys> =
    K extends ModuleSettingKeys.dialogDisplay ? boolean :
    K extends ModuleSettingKeys.publicChat ? boolean :
    K extends ModuleSettingKeys.outputWeatherToChat ? boolean :
    K extends ModuleSettingKeys.outputDateToChat ? boolean :
    K extends ModuleSettingKeys.useFX ? string :
    K extends ModuleSettingKeys.FXByScene ? boolean :
    K extends ModuleSettingKeys.attachToCalendar ? boolean :
    K extends ModuleSettingKeys.storeInSCNotes ? boolean :
    K extends ModuleSettingKeys.useForecasts ? boolean :
    K extends ModuleSettingKeys.useCelsius ? boolean :
    K extends ModuleSettingKeys.playSound ? boolean :
    // K extends ModuleSettingKeys.normalizeVolume ? boolean :
    K extends ModuleSettingKeys.soundVolume ? number :
    K extends ModuleSettingKeys.previousVersion ? string :
    K extends ModuleSettingKeys.displayOptions ? DisplayOptions :
    K extends ModuleSettingKeys.lastWeatherData ? (WeatherData | null) :  
    K extends ModuleSettingKeys.season ? number :
    K extends ModuleSettingKeys.seasonSync ? boolean :
    K extends ModuleSettingKeys.fxActive ? boolean :
    K extends ModuleSettingKeys.activeFXMParticleEffects ? string[] :
    K extends ModuleSettingKeys.activeFXMFilterEffects ? string[] :
    K extends ModuleSettingKeys.windowPosition ? (WindowPosition | null) :
    K extends ModuleSettingKeys.biome ? string :
    K extends ModuleSettingKeys.climate ? number :
    K extends ModuleSettingKeys.humidity ? number :
    K extends ModuleSettingKeys.manualPause ? boolean :
    K extends ModuleSettingKeys.customChatMessages ? string[][][] :
    K extends ModuleSettingKeys.forecasts ? Record<string, Forecast> :
    never;  

export class ModuleSettings {
  public static isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public static get<T extends ModuleSettingKeys>(setting: T): SettingType<T> {
    if (setting === ModuleSettingKeys.lastWeatherData) {
      const loaded = game.settings.get(moduleJson.id, setting) as SettingType<T> as WeatherData;  // not really WeatherData - need to attach functions

      if (loaded) {
        // validate - if invalid, pretend we didn't find anything
        if (!WeatherData.validateWeatherParameters(loaded.climate as Climate, loaded.humidity, loaded.hexFlowerCell)) {
          return null as SettingType<T>;
        } else {
          return new WeatherData(loaded.date, loaded.season, loaded.humidity, loaded.climate, loaded.hexFlowerCell, loaded.temperature) as SettingType<T>;
        }
      } else {
        return null as SettingType<T>;
      }
    } else if (setting === ModuleSettingKeys.forecasts) {
      // need to cast to forecasts
      const loaded = game.settings.get(moduleJson.id, setting) as Record<string, Forecast>;
      const cleaned = {} as Record<string, Forecast>;

      for (const key in loaded) {
        cleaned[key] = new Forecast(loaded[key].timestamp, loaded[key].climate, loaded[key].humidity, loaded[key].hexFlowerCell);
      }

      return cleaned as SettingType<T>;
    } else {
      // for some reason booleans are sometimes coming back as Boolean
      if (game.settings.get(moduleJson.id, setting) instanceof Boolean) {
        return (game.settings.get(moduleJson.id, setting) as Boolean).valueOf() as SettingType<T>;
      } else {
        return game.settings.get(moduleJson.id, setting) as SettingType<T>;
      }
    }
  }

  public static async set<T extends ModuleSettingKeys>(setting: T, value: SettingType<T>): Promise<void> {
    // confirm the user can set it
    if (!isClientGM()) {
      // if it's any of the global param lists, don't do the set
      if (ModuleSettings.menuParams.find(({settingID}): boolean => (settingID === setting)) || 
        ModuleSettings.displayParams.find(({settingID}): boolean => (settingID === setting)) || 
        ModuleSettings.internalParams.find(({settingID}): boolean => (settingID === setting)))
      return;
    }

    await game.settings.set(moduleJson.id, setting, value);
  }

  private static register(settingKey: string, settingConfig: ClientSettings.PartialSettingConfig) {
    game.settings.register(moduleJson.id, settingKey, settingConfig);
  }

  private static registerMenu(settingKey: string, settingConfig: ClientSettings.PartialSettingSubmenuConfig) {
    game.settings.registerMenu(moduleJson.id, settingKey, settingConfig);
  }

  // these are global menus (shown at top)
  private static menuParams: (ClientSettings.PartialSettingSubmenuConfig & { settingID: ModuleSettingKeys })[] = [
    // couldn't get this to work because it creates a new instance but I can't figure out how to attach it to the weatherInstance variable in main.js
    // {
    //     settingID: ModuleSettingKeys.showApplication,
    //     name: '',
    //     label: 'Open Simple Weather',
    //     hint: 'Reopen the main window if closed',
    //     icon: "fa fa-calendar",
    //     type: WeatherApplication,
    // },
    {
      settingID: 'mySettingsMenu',
      name: 'settings.customWeather',
      label: 'swr.settings.customWeatherButton',   // localized by Foundry
      hint: 'settings.customWeatherHelp',
      icon: 'fas fa-bars',               // A Font Awesome icon used in the submenu button
      type: CustomMessageSettingsApplication,
    }
  ];

  // these are local menus (shown at top)
  private static localMenuParams: (ClientSettings.PartialSettingSubmenuConfig & { settingID: ModuleSettingKeys })[] = [
  ];

  // these are globals shown in the options
  // name and hint should be the id of a localization string
  private static displayParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
    {
      settingID: ModuleSettingKeys.outputWeatherToChat,
      name: 'settings.outputWeatherToChat',
      hint: 'settings.outputWeatherToChatHelp',
      default: true,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.outputDateToChat,
      name: 'settings.outputDateToChat',
      hint: 'settings.outputDateToChatHelp',
      default: false,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.publicChat,
      name: 'settings.publicChat',
      hint: 'settings.publicChatHelp',
      default: true,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.dialogDisplay, 
      name: 'settings.dialogDisplay',
      hint: 'settings.dialogDisplayHelp',
      default: true,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.useFX, 
      name: 'settings.useFX',
      hint: 'settings.useFXHelp',
      requiresReload: true,   
      type: String,
      choices: {  // these get localized by Foundry
        'off': 'swr.settings.options.useFX.choices.off',
        'core': 'swr.settings.options.useFX.choices.core',
        'fxmaster': 'swr.settings.options.useFX.choices.fxmaster',
      },
      default: 'off',
    },
    {
      settingID: ModuleSettingKeys.FXByScene, 
      name: 'settings.FXByScene',
      hint: 'settings.FXBySceneHelp',
      requiresReload: true,     
      type: Boolean,
      default: false,
    },
    {
      settingID: ModuleSettingKeys.attachToCalendar, 
      name: 'settings.attachToCalendar',
      hint: 'settings.attachToCalendarHelp',
      default: false,
      requiresReload: true,    
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.storeInSCNotes, 
      name: 'settings.storeInSCNotes',
      hint: 'settings.storeInSCNotesHelp',
      default: false,
      requiresReload: false,    
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.useForecasts, 
      name: 'settings.useForecasts',
      hint: 'settings.useForecastsHelp',
      default: true,
      requiresReload: true,    
      type: Boolean,
    },
  ];

  // these are client-specific and displayed in settings
  private static localDisplayParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
    {
      settingID: ModuleSettingKeys.useCelsius, 
      name: 'settings.useCelsius',
      hint: 'settings.useCelsiusHelp',
      default: false,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.playSound,
      name: 'settings.playSound',
      hint: 'settings.playSoundHelp',
      default: true,
      requiresReload: true,
      type: Boolean,
    },
    // {
    //   settingID: ModuleSettingKeys.normalizeVolume,
    //   name: 'settings.normalizeVolume',
    //   hint: 'settings.normalizeVolumeHelp',
    //   default: true,
    //   requiresReload: true,
    //   type: Boolean,
    // },
    {
      settingID: ModuleSettingKeys.soundVolume,
      name: 'settings.soundVolume',
      hint: 'settings.soundVolumeHelp',
      default: 0.5,
      requiresReload: true,
      type: new foundry.data.fields.NumberField({ nullable: false, min: 0, max: 100, step: 1, initial: 50}),
    },
  ];

  // these are globals only used internally
  private static internalParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
    {
      settingID: ModuleSettingKeys.activeFXMParticleEffects,
      name: 'Active FX particle effects',
      type: Array,
      default: []
    },
    {
      settingID: ModuleSettingKeys.activeFXMFilterEffects,
      name: 'Active FX filter effects',
      type: Array,
      default: []
    },
    {
      settingID: ModuleSettingKeys.lastWeatherData,
      name: 'Last weather data',
      type: Object,
      default: null
    },
    {
      settingID: ModuleSettingKeys.season,
      name: 'Last season',
      type: Number,
      default: 0
    },
    {
      settingID: ModuleSettingKeys.seasonSync,
      name: 'Season sync',
      type: Boolean,
      default: true
    },
    {
      settingID: ModuleSettingKeys.biome,
      name: 'Last biome',
      type: String,
      default: ''
    },
    {
      settingID: ModuleSettingKeys.climate,
      name: 'Last climate',
      type: Number,
      default: 0
    },
    {
      settingID: ModuleSettingKeys.humidity,
      name: 'Last humidity',
      type: Number,
      default: 0
    },
    {
      settingID: ModuleSettingKeys.manualPause,
      name: 'Manual pause',
      type: Boolean,
      default: false
    },
    {
      settingID: ModuleSettingKeys.customChatMessages,
      name: 'Custom chat messages',
      type: Array,
      default: new Array(Object.keys(Climate).length/2)
      .fill('')
      .map(() => new Array(Object.keys(Humidity).length/2)
        .fill('')
        .map(() => new Array(37).fill('')))
    },
    {
      settingID: ModuleSettingKeys.forecasts,
      name: 'Forecasts',
      type: Object,
      default: {}
    },
    {
      settingID: ModuleSettingKeys.previousVersion, 
      name: 'Previous version',
      type: String,
      default: '',
    },

  ];
  
  // these are client-specific only used internally
  private static localInternalParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
    {
      settingID: ModuleSettingKeys.fxActive,
      name: 'FX Active',
      type: Object,
      default: true,
    },
    {
      settingID: ModuleSettingKeys.windowPosition,
      name: 'Window Position',
      type: Object,
      default: null
    },
    {
      settingID: ModuleSettingKeys.displayOptions,
      name: 'Display Options',
      type: Object,
      default: {
        dateBox: true,
        weatherBox: false,
        seasonBar: false,
        biomeBar: false,
      }
    },
  ];

  public static registerSettings(): void {
    for (let i=0; i<ModuleSettings.menuParams.length; i++) {
      const { settingID, ...settings} = ModuleSettings.menuParams[i];

      ModuleSettings.registerMenu(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        restricted: true,
      });
    }

    for (let i=0; i<ModuleSettings.localMenuParams.length; i++) {
      const { settingID, ...settings} = ModuleSettings.localMenuParams[i];

      ModuleSettings.registerMenu(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        restricted: false,
      });
    }

    for (let i=0; i<ModuleSettings.displayParams.length; i++) {
      const { settingID, ...settings} = ModuleSettings.displayParams[i];

      ModuleSettings.register(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        scope: 'world',
        config: true,
      });
    }

    for (let i=0; i<ModuleSettings.localDisplayParams.length; i++) {
      const { settingID, ...settings} = ModuleSettings.localDisplayParams[i];

      ModuleSettings.register(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        scope: 'client',
        config: true,
      });
    }

    for (let i=0; i<ModuleSettings.internalParams.length; i++) {
      const { settingID, ...settings} = ModuleSettings.internalParams[i];

      ModuleSettings.register(settingID, {
        ...settings,
        scope: 'world',
        config: false,
        restricted: true,
      });
    }

    for (let i=0; i<ModuleSettings.localInternalParams.length; i++) {
      const { settingID, ...settings} = ModuleSettings.localInternalParams[i];

      ModuleSettings.register(settingID, {
        ...settings,
        scope: 'client',
        config: false,
        restricted: false,
      });
    }
  }
}
