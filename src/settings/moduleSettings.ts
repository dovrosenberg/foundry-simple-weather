import moduleJson from '@module';

import { WindowPosition } from '@/window/WindowPosition';
import { getGame, localize } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';
import { DisplayOptions } from '@/types/DisplayOptions';

export enum SettingKeys {
  // displayed in settings
  dialogDisplay = 'dialogDisplay',   // can non-GM clients see the dialog box
  outputWeatherToChat = 'outputWeatherChat',   // when new weather is generated, should it be put in the chat box
  publicChat = 'publicChat',   // should everyone see the chat (true) or just the GM (false)
  useCelsius = 'useCelsius',   // should we use Celsius
  useFX = 'useFX',  // the name of the package used for FX (or 'off' if none)

  // internal only
  windowPosition = 'windowPosition',   // the current position of the window
  displayOptions = 'displayOptions',  // how is the application window configured
  lastWeatherData = 'lastWeatherData',  // the previously generated weather data
  season = 'season',   // the current season
  seasonSync = 'seasonSync',       // should we sync with simple calendar
  biome = 'biome',  // the current biome
  climate = 'climate',   // the current climate
  humidity = 'humidity',   // the current humidity
}

type SettingType<K extends SettingKeys> =
    K extends SettingKeys.dialogDisplay ? boolean :
    K extends SettingKeys.publicChat ? boolean :
    K extends SettingKeys.outputWeatherToChat ? boolean :
    K extends SettingKeys.useCelsius ? boolean :
    K extends SettingKeys.useFX ? string :
    K extends SettingKeys.displayOptions ? DisplayOptions :
    K extends SettingKeys.lastWeatherData ? (WeatherData | null) :  
    K extends SettingKeys.season ? number :
    K extends SettingKeys.seasonSync ? boolean :
    K extends SettingKeys.windowPosition ? (WindowPosition | null) :
    K extends SettingKeys.biome ? string :
    K extends SettingKeys.climate ? number :
    K extends SettingKeys.humidity ? number :
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

  public get<T extends SettingKeys>(setting: T): SettingType<T> {
    if (setting === SettingKeys.lastWeatherData) {
      const loaded = getGame().settings.get(moduleJson.id, setting) as SettingType<T> as WeatherData;  // not really WeatherData - need to attach functions

      if (loaded) 
        return new WeatherData(loaded.date, loaded.season, loaded.humidity, loaded.climate, loaded.hexFlowerCell, loaded.temperature) as SettingType<T>;
      else 
        return null as SettingType<T>;
    } else
      return getGame().settings.get(moduleJson.id, setting) as SettingType<T>;
  }

  public async set<T extends SettingKeys>(setting: T, value: SettingType<T>): Promise<void> {
    await getGame().settings.set(moduleJson.id, setting, value);
  }

  private register(settingKey: string, settingConfig: ClientSettings.PartialSettingConfig) {
    getGame().settings.register(moduleJson.id, settingKey, settingConfig);
  }

  private registerSettings(): void {
    // these are globals shown in the options
    // name and hint should be the id of a localization string
    const displayParams: (InexactPartial<Omit<SettingConfig<unknown>, 'key' | 'namespace'>> & { settingID: string })[] = [
      {
        settingID: SettingKeys.outputWeatherToChat,
        name: 'sweath.settings.outputweatherToChat',
        hint: 'sweath.settings.outputweatherToChatHelp',
        default: true,
        type: Boolean,
      },
      {
        settingID: SettingKeys.publicChat,
        name: 'sweath.settings.publicChat',
        hint: 'sweath.settings.publicChatHelp',
        default: true,
        type: Boolean,
      },
      {
        settingID: SettingKeys.dialogDisplay, 
        name: 'sweath.settings.dialogDisplay',
        hint: 'sweath.settings.dialogDisplayHelp',
        default: true,
        type: Boolean,
      },
    ];

    // these are client-specific and displayed in settings
    const localDisplayParams: (InexactPartial<Omit<SettingConfig<unknown>, 'key' | 'namespace'>> & { settingID: string })[] = [
      {
        settingID: SettingKeys.useCelsius, 
        name: 'sweath.settings.useCelsius',
        hint: 'sweath.settings.useCelsiusHelp',
        default: false,
        type: Boolean,
      },
      {
        settingID: SettingKeys.useFX, 
        name: 'sweath.settings.useFX',
        hint: 'sweath.settings.useFXHelp',
        requiresReload: true,   // can't find the right typescript type, but this does work
        type: String,
        choices: {
          'off': 'sweath.settings.options.useFX.choices.off',
          'core': 'sweath.settings.options.useFX.choices.core'
        },
        default: 'core',
      },
    ];

    // these are globals only used internally
    const internalParams: (InexactPartial<Omit<SettingConfig<unknown>, 'key' | 'namespace'>> & { settingID: string })[] = [
      {
        settingID: SettingKeys.lastWeatherData,
        name: 'Last weather data',
        type: Object,
        default: null
      },
      {
        settingID: SettingKeys.season,
        name: 'Last season',
        type: Number,
        default: 0
      },
      {
        settingID: SettingKeys.seasonSync,
        name: 'Season sync',
        type: Boolean,
        default: false
      },
      {
        settingID: SettingKeys.biome,
        name: 'Last biome',
        type: String,
        default: ''
      },
      {
        settingID: SettingKeys.climate,
        name: 'Last climate',
        type: Number,
        default: 0
      },
      {
        settingID: SettingKeys.humidity,
        name: 'Last humidity',
        type: Number,
        default: 0
      },
    ];
   
    // these are client-specfic only used internally
    const localInternalParams: (InexactPartial<Omit<SettingConfig<unknown>, 'key' | 'namespace'>> & { settingID: string })[] = [
      {
        settingID: SettingKeys.windowPosition,
        name: 'Window Position',
        type: Object,
        default: null
      },
      {
        settingID: SettingKeys.displayOptions,
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

    for (let i=0; i<displayParams.length; i++) {
      const { settingID, ...settings} = displayParams[i];
      this.register(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        scope: 'world',
        config: true,
      });
    }

    for (let i=0; i<localDisplayParams.length; i++) {
      const { settingID, ...settings} = localDisplayParams[i];
      this.register(settingID, {
        ...settings,
        name: settings.name ? localize(settings.name) : '',
        hint: settings.hint ? localize(settings.hint) : '',
        scope: 'client',
        config: true,
      });
    }

    for (let i=0; i<internalParams.length; i++) {
      const { settingID, ...settings} = internalParams[i];
      this.register(settingID, {
        ...settings,
        scope: 'world',
        config: false,
      });
    }

    for (let i=0; i<localInternalParams.length; i++) {
      const { settingID, ...settings} = localInternalParams[i];
      this.register(settingID, {
        ...settings,
        scope: 'client',
        config: false,
      });
    }
  }
}
