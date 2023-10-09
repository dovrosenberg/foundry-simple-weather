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
}

export class ModuleSettings {
  constructor() {
    this.registerSettings();
  }

  public isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public getWindowPosition(): WindowPosition {
    const windowPosition = this.get(SettingKeys.windowPosition) as unknown as WindowPosition;
    return windowPosition;
  }

  public async setWindowPosition(position: WindowPosition) {
    this.set(SettingKeys.windowPosition, position);
  }

  public getDialogDisplay(): boolean {
    return this.get(SettingKeys.dialogDisplay) as any;
  }

  public getOutputWeatherToChat(): boolean {
    return this.get(SettingKeys.outputWeatherToChat) as any;
  }

  public getUseCelsius(): boolean {
    return this.get(SettingKeys.useCelsius) as any;
  }

  public getLastWeatherData(): WeatherData | null{
    const loaded = this.get(SettingKeys.lastWeatherData) as WeatherData;  // not really WeatherData - need to attach functions

    if (loaded) 
      return new WeatherData(loaded.date, loaded.season, loaded.humidity, loaded.climate, loaded.hexFlowerCell, loaded.temperature);
    else 
      return null;
  }

  public async setLastWeatherData(weatherData: WeatherData) {
    await this.set(SettingKeys.lastWeatherData, weatherData);
  }

  private register(settingKey: string, settingConfig: ClientSettings.PartialSettingConfig) {
    getGame().settings.register(moduleJson.id, settingKey, settingConfig);
  }

  private get(settingKey: SettingKeys): unknown {
    return getGame().settings.get(moduleJson.id, settingKey);
  }

  private async set(settingKey: SettingKeys, value: any): Promise<any> {
    return getGame().settings.set(moduleJson.id, settingKey, value);
  }

  private registerSettings(): void {
    this.register(SettingKeys.windowPosition, {
      name: 'Window Position',
      scope: 'client',
      config: false,
      type: Object,
      default: { top: 100, left: 100 }
    });

    this.register(SettingKeys.lastWeatherData, {
      name: 'Last weather data',
      scope: 'world',
      config: false,
      type: Object,
      default: null
    });

    this.register(SettingKeys.outputWeatherToChat, {
      name: localize('sweath.settings.OutputWeatherToChat'),
      hint: localize('sweath.settings.OutputWeatherToChatHelp'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    this.register(SettingKeys.dialogDisplay, {
      name: localize('sweath.settings.DialogDisplay'),
      hint: localize('sweath.settings.DialogDisplayHelp'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    this.register(SettingKeys.useCelsius, {
      name: localize('sweath.settings.useCelsius'),
      hint: localize('sweath.settings.useCelsiusHelp'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    });
  }
}
