import moduleJson from '@module';

import { WindowPosition } from '@/window/WindowPosition';
import { getGame, isClientGM, localize } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';
import { DisplayOptions } from '@/types/DisplayOptions';
import { CustomMessageSettingsApplication } from '@/applications/CustomMessageSettingsApplication';
import { Climate, Humidity } from '@/weather/climateData';

export enum ModuleSettingKeys {
  // displayed in settings
  dialogDisplay = 'dialogDisplay',   // can non-GM clients see the dialog box
  outputWeatherToChat = 'outputWeatherChat',   // when new weather is generated, should it be put in the chat box
  publicChat = 'publicChat',   // should everyone see the chat (true) or just the GM (false)
  useCelsius = 'useCelsius',   // should we use Celsius
  useFX = 'useFX',  // the name of the package used for FX (or 'off' if none)
  FXByScene = 'FXByScene',  // should we use FX by scene or by module
  attachToCalendar = 'attachToCalendar',  // should we attach to simple calendar instead of standalone window
  storeInSCNotes = 'storeInSCNotes',   // should we store weather in simple calendar notes 

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
}

type SettingType<K extends ModuleSettingKeys> =
    K extends ModuleSettingKeys.dialogDisplay ? boolean :
    K extends ModuleSettingKeys.publicChat ? boolean :
    K extends ModuleSettingKeys.outputWeatherToChat ? boolean :
    K extends ModuleSettingKeys.useCelsius ? boolean :
    K extends ModuleSettingKeys.useFX ? string :
    K extends ModuleSettingKeys.FXByScene ? boolean :
    K extends ModuleSettingKeys.attachToCalendar ? boolean :
    K extends ModuleSettingKeys.storeInSCNotes ? boolean :
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
    never;  

// the solo instance
export let moduleSettings: ModuleSettings;

// set the main application; should only be called once
export function updateModuleSettings(settings: ModuleSettings): void {
  moduleSettings = settings;
}

export class ModuleSettings {
  constructor() {
    this.registerSettings();
  }

  public isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public get<T extends ModuleSettingKeys>(setting: T): SettingType<T> {
    if (setting === ModuleSettingKeys.lastWeatherData) {
      const loaded = getGame().settings.get(moduleJson.id, setting) as SettingType<T> as WeatherData;  // not really WeatherData - need to attach functions

      if (loaded) 
        return new WeatherData(loaded.date, loaded.season, loaded.humidity, loaded.climate, loaded.hexFlowerCell, loaded.temperature) as SettingType<T>;
      else 
        return null as SettingType<T>;
    } else
      return getGame().settings.get(moduleJson.id, setting) as SettingType<T>;
  }

  public async set<T extends ModuleSettingKeys>(setting: T, value: SettingType<T>): Promise<void> {
    // confirm the user can set it
    if (!isClientGM()) {
      // if it's any of the global param lists, don't do the set
      if (this.menuParams.find(({settingID}): boolean => (settingID === setting)) || 
        this.displayParams.find(({settingID}): boolean => (settingID === setting)) || 
        this.internalParams.find(({settingID}): boolean => (settingID === setting)))
      return;
    }

    await getGame().settings.set(moduleJson.id, setting, value);
  }

  private register(settingKey: string, settingConfig: ClientSettings.PartialSettingConfig) {
    getGame().settings.register(moduleJson.id, settingKey, settingConfig);
  }

  private registerMenu(settingKey: string, settingConfig: ClientSettings.PartialSettingSubmenuConfig) {
    getGame().settings.registerMenu(moduleJson.id, settingKey, settingConfig);
  }

  // these are global menus (shown at top)
  private menuParams: (ClientSettings.PartialSettingSubmenuConfig & { settingID: ModuleSettingKeys })[] = [
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
      name: 'sweath.settings.customWeather',
      label: 'sweath.settings.customWeatherButton',
      hint: 'sweath.settings.customWeatherHelp',
      icon: 'fas fa-bars',               // A Font Awesome icon used in the submenu button
      type: CustomMessageSettingsApplication,
    }
  ];

  // these are local menus (shown at top)
  private localMenuParams: (ClientSettings.PartialSettingSubmenuConfig & { settingID: ModuleSettingKeys })[] = [
  ];

  // these are globals shown in the options
  // name and hint should be the id of a localization string
  private displayParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
    {
      settingID: ModuleSettingKeys.outputWeatherToChat,
      name: 'sweath.settings.outputweatherToChat',
      hint: 'sweath.settings.outputweatherToChatHelp',
      default: true,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.publicChat,
      name: 'sweath.settings.publicChat',
      hint: 'sweath.settings.publicChatHelp',
      default: true,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.dialogDisplay, 
      name: 'sweath.settings.dialogDisplay',
      hint: 'sweath.settings.dialogDisplayHelp',
      default: true,
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.useFX, 
      name: 'sweath.settings.useFX',
      hint: 'sweath.settings.useFXHelp',
      requiresReload: true,   
      type: String,
      choices: {  // can't find the right typescript type, but this does work
        'off': 'sweath.settings.options.useFX.choices.off',
        'core': 'sweath.settings.options.useFX.choices.core',
        'fxmaster': 'sweath.settings.options.useFX.choices.fxmaster',
      },
      default: 'off',
    },
    {
      settingID: ModuleSettingKeys.FXByScene, 
      name: 'sweath.settings.FXByScene',
      hint: 'sweath.settings.FXBySceneHelp',
      requiresReload: true,     // can't find the right typescript type, but this does work
      type: Boolean,
      default: false,
    },
    {
      settingID: ModuleSettingKeys.attachToCalendar, 
      name: 'sweath.settings.attachToCalendar',
      hint: 'sweath.settings.attachToCalendarHelp',
      default: false,
      requiresReload: true,    // can't find the right typescript type, but this does work
      type: Boolean,
    },
    {
      settingID: ModuleSettingKeys.storeInSCNotes, 
      name: 'sweath.settings.storeInSCNotes',
      hint: 'sweath.settings.storeInSCNotesHelp',
      default: false,
      requiresReload: false,    // can't find the right typescript type, but this does work
      type: Boolean,
    },
  ];

  // these are client-specific and displayed in settings
  private localDisplayParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
    {
      settingID: ModuleSettingKeys.useCelsius, 
      name: 'sweath.settings.useCelsius',
      hint: 'sweath.settings.useCelsiusHelp',
      default: false,
      type: Boolean,
    },
  ];

  // these are globals only used internally
  private internalParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
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
  
  ];
  
  // these are client-specfic only used internally
  private localInternalParams: (ClientSettings.PartialSettingConfig & { settingID: ModuleSettingKeys })[] = [
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

  private registerSettings(): void {
    for (let i=0; i<this.menuParams.length; i++) {
      const { settingID, ...settings} = this.menuParams[i];
      this.registerMenu(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        restricted: false,
      });
    }

    for (let i=0; i<this.localMenuParams.length; i++) {
      const { settingID, ...settings} = this.localMenuParams[i];
      this.registerMenu(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        restricted: true,
      });
    }

    for (let i=0; i<this.displayParams.length; i++) {
      const { settingID, ...settings} = this.displayParams[i];
      this.register(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        scope: 'world',
        config: true,
      });
    }

    for (let i=0; i<this.localDisplayParams.length; i++) {
      const { settingID, ...settings} = this.localDisplayParams[i];
      this.register(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        scope: 'client',
        config: true,
      });
    }

    for (let i=0; i<this.internalParams.length; i++) {
      const { settingID, ...settings} = this.internalParams[i];
      this.register(settingID, {
        ...settings,
        scope: 'world',
        config: false,
      });
    }

    for (let i=0; i<this.localInternalParams.length; i++) {
      const { settingID, ...settings} = this.localInternalParams[i];
      this.register(settingID, {
        ...settings,
        scope: 'client',
        config: false,
      });
    }
  }
}
