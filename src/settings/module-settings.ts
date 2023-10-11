import moduleJson from '@module';

import { WindowPosition } from '@/window/WindowPosition';
import { getGame, localize } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';

export enum SettingKeys {
  // displayed in settings
  dialogDisplay = 'dialogDisplay',   // can non-GM clients see the dialog box
  outputWeatherToChat = 'outputWeatherChat',   // when new weather is generated, should it be put in the chat box
  useCelsius = 'useCelsius',   // should we use Celsius

  // internal only
  windowPosition = 'windowPosition',   // the current position of the window
  lastWeatherData = 'lastWeatherData',  // the previously generated weather data
  season = 'season',   // the current season
  biome = 'biome',  // the current biome
  climate = 'climate',   // the current climate
  humidity = 'humidity',   // the current humidity
}

type SettingType<K extends SettingKeys> =
  K extends SettingKeys.dialogDisplay ? boolean :
  K extends SettingKeys.outputWeatherToChat ? boolean :
  K extends SettingKeys.useCelsius ? boolean :
  K extends SettingKeys.windowPosition ? WindowPosition :
  K extends SettingKeys.lastWeatherData ? (WeatherData | null) :  
  K extends SettingKeys.season ? string :
  K extends SettingKeys.biome ? string :
  K extends SettingKeys.climate ? number :
  K extends SettingKeys.humidity ? number :
  never;  // Add more cases for other enum values as needed

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
    const settingParams: (InexactPartial<Omit<SettingConfig<unknown>, 'key' | 'namespace'>> & { settingID: string })[] = [
      {
        settingID: SettingKeys.dialogDisplay,
        name: localize('sweath.settings.OutputWeatherToChat'),
        hint: localize('sweath.settings.OutputWeatherToChatHelp'),
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
      },
      {
        settingID: SettingKeys.windowPosition,
        name: 'Window Position',
        scope: 'client',
        config: false,
        type: Object,
        default: { top: 100, left: 100 }
      },
      {
        settingID: SettingKeys.lastWeatherData,
        name: 'Last weather data',
        scope: 'world',
        config: false,
        type: Object,
        default: null
      },
      {
        settingID: SettingKeys.dialogDisplay, 
        name: localize('sweath.settings.DialogDisplay'),
        hint: localize('sweath.settings.DialogDisplayHelp'),
        scope: 'world',
        config: true,
        default: true,
        type: Boolean,
      },
      {
        settingID: SettingKeys.useCelsius, 
        name: localize('sweath.settings.useCelsius'),
        hint: localize('sweath.settings.useCelsiusHelp'),
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
      },
    ];

    for (let i=0; i<settingParams.length; i++) {
      const { settingID, ...settings} = settingParams[i];
      this.register(settingID, settings);
    }
  }
}
