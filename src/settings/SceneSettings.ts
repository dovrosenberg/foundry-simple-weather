import moduleJson from '@module';

import { getGame, isClientGM } from '@/utils/game';

// stores the settings in flags with the given names, so should all have 'swr' in front of them
export enum SceneSettingKeys {
  fxActive = 'swr-fxActive',   // are the fx turned on for this scene (only used if the module setting says to use scene-level)
}

type SettingType<K extends SceneSettingKeys> =
    K extends SceneSettingKeys.fxActive ? boolean :
    never;  

// the solo instance
export let sceneSettings: SceneSettings;

// set the main application; should only be called once
export function updateSceneSettings(settings: SceneSettings): void {
  sceneSettings = settings;
}

// configuration for the various settings
type SceneSettingConfig<T extends SceneSettingKeys> = {
  settingID: T,
  default: SettingType<T>,
}

export class SceneSettings {
  constructor() {
  }

  public isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public get<T extends SceneSettingKeys>(setting: T): SettingType<T> {
    let value = getGame().scenes?.active?.getFlag(moduleJson.id, setting) as SettingType<T>;

    // if undefined, return the default (and initialize on the scene)
    if (value===undefined) {
      value = this.params.find(p=>(p.settingID===setting))?.default as SettingType<T>;
      void this.set(setting, value);
    }

    return value;
  }

  public async set<T extends SceneSettingKeys>(setting: T, value: SettingType<T>): Promise<void> {
    // confirm the user can set it
    if (!isClientGM()) {
      return;
    }

    if (!getGame().scenes?.active) {
      throw new Error('Tried to save scene setting but no active scene');
    }

    await getGame().scenes?.active?.setFlag(moduleJson.id, setting, value);
  }

  private params: SceneSettingConfig<any>[] = [
    {
      settingID: SceneSettingKeys.fxActive,
      default: true,
    },
  ];
}

