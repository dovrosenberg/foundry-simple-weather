import moduleJson from '@module';
import { SimpleCalendarApi } from '@/libraries/simple-calendar/api';
import { SimpleCalendarPresenter } from '@/libraries/simple-calendar/simple-calendar-presenter';
import { Climate } from '@/models/climate';

import { WeatherData } from '../models/weatherData';
import { WindowPosition } from '../models/windowPosition';

export enum SettingKeys {
  calendarDisplay = 'calendarDisplay',
  noticeVersion = 'noticeVersion',
  outputWeatherToChat = 'outputWeatherChat',
  playerSeeWeatherInfo = 'playerSeeWeatherInfo',
  useCelcius = 'useCelcius',
  weatherData = 'weatherData',
  windowPosition = 'windowPosition',
}

export class ModuleSettings {
  constructor(private gameRef: Game) {
    this.registerSettings();
  }

  public isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public getModuleName(): string {
    return moduleJson.name;
  }

  public getVersion(): string {
    return moduleJson.version;
  }

  public getVersionsWithNotices(): Array<string> {
    return moduleJson.versionsWithNotices;
  }

  public getWeatherData(): WeatherData {
    return new WeatherData(this.get(SettingKeys.weatherData));
  }

  public setWeatherData(value: WeatherData): Promise<void> {
    return this.set(SettingKeys.weatherData, value);
  }

  public getWindowPosition(): WindowPosition {
    return this.get(SettingKeys.windowPosition) as any;
  }

  public setWindowPosition(position: WindowPosition) {
    this.set(SettingKeys.windowPosition, position);
  }

  public getCalendarDisplay(): boolean {
    return this.get(SettingKeys.calendarDisplay) as any;
  }

  public getOutputWeatherToChat(): boolean {
    return this.get(SettingKeys.outputWeatherToChat) as any;
  }

  public getUseCelcius(): boolean {
    return this.get(SettingKeys.useCelcius) as any;
  }

  public getPlayerSeeWeather(): boolean {
    return this.get(SettingKeys.playerSeeWeatherInfo) as any;
  }

  public getListOfReadNoticesVersions(): Array<string> {
    return this.get(SettingKeys.noticeVersion) as any;
  }

  public addVersionToReadNotices(version: string) {
    const list = this.getListOfReadNoticesVersions();
    list.push(version);

    this.set(SettingKeys.noticeVersion, list);
  }

  private register(settingKey: string, settingConfig: ClientSettings.PartialSettingConfig) {
    this.gameRef.settings.register(this.getModuleName(), settingKey, settingConfig);
  }

  private get(settingKey: SettingKeys): unknown {
    return this.gameRef.settings.get(this.getModuleName(), settingKey);
  }

  private set(settingKey: SettingKeys, value: any): Promise<any> {
    return this.gameRef.settings.set(this.getModuleName(), settingKey, value);
  }

  private registerSettings(): void {
    this.register(SettingKeys.windowPosition, {
      name: 'Calendar Position',
      scope: 'client',
      config: false,
      type: Object,
      default: { top: 100, lefT: 100 }
    });

    this.register(SettingKeys.weatherData, {
      name: 'Weather Data',
      scope: 'world',
      config: false,
      type: Object,
      default: this.createDefaultWeatherData()
    });

    this.register(SettingKeys.weatherData + 'Backup', {
      name: 'Weather Data Backup',
      scope: 'world',
      config: false,
      type: Object,
      default: null
    });

    this.register(SettingKeys.noticeVersion, {
      name: 'Version of the last notice displayed',
      scope: 'world',
      config: false,
      type: Array,
      default: [],
    });

    this.register(SettingKeys.calendarDisplay, {
      name: this.gameRef.i18n.localize('sweath.settings.DisplayWindowNonGM'),
      hint: this.gameRef.i18n.localize('sweath.settings.DisplayWindowNonGMHelp'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    this.register(SettingKeys.outputWeatherToChat, {
      name: this.gameRef.i18n.localize('sweath.settings.OutputWeatherToChat'),
      hint: this.gameRef.i18n.localize('sweath.settings.OutputWeatherToChatHelp'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    this.register(SettingKeys.useCelcius, {
      name: this.gameRef.i18n.localize('sweath.settings.useCelcius'),
      hint: this.gameRef.i18n.localize('sweath.settings.useCelciusHelp'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    });

    this.register(SettingKeys.playerSeeWeatherInfo, {
      name: this.gameRef.i18n.localize('sweath.settings.playerSeeWeather'),
      hint: this.gameRef.i18n.localize('sweath.settings.playerSeeWeatherHelp'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    });
  }

  private createDefaultWeatherData(): WeatherData {
    const currentDate = SimpleCalendarPresenter.timestampToDate(SimpleCalendarApi.timestamp());

    return new WeatherData({
      climate: new Climate(),
      currentDate,
      lastTemp: null,
      precipitation: null,
      temp: null,
      tempRange: null,
      version: 1
    });
  }
}
