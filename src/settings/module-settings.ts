import moduleJson from '@module';

import { WindowPosition } from '../models/windowPosition';

export enum SettingKeys {
  // displayed in settings
  dialogDisplay = 'dialogDisplay',   // can non-GM clients see the dialog box
  outputWeatherToChat = 'outputWeatherChat',   // when new weather is generated, should it be put in the chat box
  useCelsius = 'useCelsius',   // should we use Celsius
  windowPosition = 'windowPosition',   // the current position of the window

  // internal only
  noticeVersion = 'noticeVersion',   // ??? 
}

export class ModuleSettings {
  constructor(private gameRef: Game) {
    this.registerSettings();
  }

  public isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public getModuleName(): string {
    return moduleJson.id;
  }

  public getVersion(): string {
    return moduleJson.version;
  }

  public getVersionsWithNotices(): Array<string> {
    return moduleJson.versionsWithNotices;
  }

  public getWindowPosition(): WindowPosition {
    return this.get(SettingKeys.windowPosition) as unknown as WindowPosition;
  }

  public setWindowPosition(position: WindowPosition) {
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
      default: { top: 100, left: 100 }
    });

    this.register(SettingKeys.noticeVersion, {
      name: 'Version of the last notice displayed',
      scope: 'world',
      config: false,
      type: Array,
      default: [],
    });

    this.register(SettingKeys.outputWeatherToChat, {
      name: this.gameRef.i18n.localize('sweath.settings.OutputWeatherToChat'),
      hint: this.gameRef.i18n.localize('sweath.settings.OutputWeatherToChatHelp'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    this.register(SettingKeys.dialogDisplay, {
      name: this.gameRef.i18n.localize('sweath.settings.DialogDisplay'),
      hint: this.gameRef.i18n.localize('sweath.settings.DialogDisplayHelp'),
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    });

    this.register(SettingKeys.useCelsius, {
      name: this.gameRef.i18n.localize('sweath.settings.useCelsius'),
      hint: this.gameRef.i18n.localize('sweath.settings.useCelsiusHelp'),
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    });
  }
}
