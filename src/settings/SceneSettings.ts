import moduleJson from '@module';

import { getGame, isClientGM } from '@/utils/game';

// stores the settings in flags with the given names, so should all have 'swr' in front of them
export enum SceneSettingKeys {
  fxActive = 'swr-fxActive',   // are the fx turned on for this scene (only used if the module setting says to use scene-level)
}

type SettingType<K extends SceneSettingKeys> =
    K extends SceneSettingKeys.fxActive ? boolean :
    never;  

// configuration for the various settings
type SceneSettingConfig<T extends SceneSettingKeys> = {
  settingID: T,
  default: SettingType<T>,
}

export class SceneSettings {
  private static _currentScene: Scene | null;
  
  public static get currentScene(): Scene | null { return SceneSettings._currentScene; }
  public static set currentScene(scene: Scene | null) {
    SceneSettings._currentScene = scene || getGame().scenes?.active || null;
  }

  public static isSettingValueEmpty(setting: any): boolean {
    return Object.keys(setting).length === 0 || setting === null || setting === undefined;
  }

  public static get<T extends SceneSettingKeys>(setting: T, scene?: Scene): SettingType<T> {
    const sceneToUse = scene || SceneSettings._currentScene; 

    let value: SettingType<T> | undefined = sceneToUse?.getFlag(moduleJson.id, setting);

    // if undefined, return the default (and initialize on the scene)
    if (value===undefined) {
      value = SceneSettings.params.find(p=>(p.settingID===setting))?.default as SettingType<T>;
      void SceneSettings.set(setting, value);
    }

    return value;
  }

  public static async set<T extends SceneSettingKeys>(setting: T, value: SettingType<T>, scene?: Scene): Promise<void> {
    // confirm the user can set it
    if (!isClientGM()) {
      return;
    }

    const sceneToUse = scene || SceneSettings._currentScene;

    if (!sceneToUse) {
      throw new Error('Tried to save scene setting but no active scene');
    }

    await sceneToUse?.setFlag(moduleJson.id, setting, value);
  }

  private static params: SceneSettingConfig<any>[] = [
    {
      settingID: SceneSettingKeys.fxActive,
      default: true,
    },
  ];
}

