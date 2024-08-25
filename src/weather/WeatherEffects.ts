import { ModuleSettings, moduleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import { SceneSettingKeys, sceneSettings } from '@/settings/SceneSettings';
import { getGame, isClientGM } from '@/utils/game';
import { log } from '@/utils/log';
import { VersionUtils } from '@/utils/versionUtils';
import { WeatherData } from '@/weather/WeatherData';
import { weatherOptions } from '@/weather/weatherMap';
import { FXDetail, FXMStyleTypes } from './effectsMap';

// the solo instance
let weatherEffects: WeatherEffects;

// set the main application; should only be called once
function updateWeatherEffects(effects: WeatherEffects): void {
  weatherEffects = effects;
}

class WeatherEffects {
  private _sceneReady: boolean;  // we don't want to try to activate effects before the scene is ready
  private _useFX: string;
  private _fxActive = true;
  private _lastWeatherData: WeatherData;   // we save it so we can toggle back on 
  private _activeFXMParticleEffects: string[] = [];   // names of the active particle effects (so we can turn off)
  private _activeFXMFilterEffects: string[] = [];   // names of the active filter effects (so we can turn off)

  constructor() {
    if (moduleSettings.get(ModuleSettingKeys.FXByScene)) {
      this._fxActive = false;
    } else {
      this._fxActive = moduleSettings.get(ModuleSettingKeys.fxActive);
    }
    this._useFX = moduleSettings.get(ModuleSettingKeys.useFX);

    // check the version
    if (this._useFX==='fxmaster') {
      const fxVersion = getGame().modules.get('fxmaster')?.version;

      if (!fxVersion || !getGame().modules.get('fxmaster')?.active) {
        // module is missing... but they picked it so just disable for now
        this._useFX = 'off';
        log(false, 'Disabling FXMaster because module not present');
      } else if (fxVersion!=='3.0.0' && !VersionUtils.isMoreRecent(fxVersion, '3.0.0')) {
        if (isClientGM()) {
          ui.notifications?.error('FX Master found, but version prior to v3.0.0. Make sure the latest version of FX Master is installed to use for weather effects.');
          ui.notifications?.error('Version found: ' + fxVersion);
        }
      }
    }

    this._activeFXMParticleEffects = moduleSettings.get(ModuleSettingKeys.activeFXMParticleEffects);
    this._sceneReady = false;
  }

  // are we using any special effects?
  public get useFX(): boolean {
    return (this._useFX !== 'off');
  }

  // call when the scene is ready
  public ready(weatherData: WeatherData | null): void {
    this._sceneReady = true;

    // disable any old weather; will turn back on when we finish loading
    // this.deactivateFX();

    if (weatherData)
      this.activateFX(weatherData);
    else if (this._lastWeatherData)
      this.activateFX(this._lastWeatherData);
  };

  public async setFxActive(active: boolean) {
    this._fxActive = active;

    // save to the module or scene settings
    if (moduleSettings.get(ModuleSettingKeys.FXByScene)) {
      await sceneSettings.set(SceneSettingKeys.fxActive, active);
    } else {
      await moduleSettings.set(ModuleSettingKeys.fxActive, active);
    }

    if (active)
      await this.activateFX(this._lastWeatherData);
    else  
      await this.deactivateFX();
  }

  public get fxActive(): boolean {
    return this._fxActive;
  }

  // need to turn any old ones off separately first...
  public async activateFX(weatherData: WeatherData): Promise<void> {
    this._lastWeatherData = weatherData;

    if (isClientGM()) {
      if (!this._sceneReady)
        return;

      if (!weatherData || weatherData.climate === null || weatherData.humidity === null || weatherData.hexFlowerCell === null)
        return;

      const effectOptions = weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell].fx;

      if (!effectOptions)
        return;

      // turn off any old ones
      await this.deactivateFX(this._useFX === 'core');

      switch (this._useFX) {
        case 'core':
          await getGame().scenes?.active?.update({ weather: effectOptions.core?.effect || '' });
          break;

        case 'fxmaster':
          if (effectOptions.fxMaster) {
            const effects = effectOptions.fxMaster as FXDetail[];

            for (let e=0; e<effects.length; e++) {
              const name = `swr-${effects[e].type}-${foundry.utils.randomID()}`;

              if (effects[e].style === FXMStyleTypes.Particle) {
                // adjust options
                const options = structuredClone(effects[e].options);
                
                // override direction
                if (options.direction) {
                  options.direction = Math.floor(Math.random() * (options.direction.end - options.direction.start)) + options.direction.start;
                }

                log(false, 'Adding fxmaster: ' + name);
                Hooks.call('fxmaster.switchParticleEffect', {
                  name,
                  type: effects[e].type,
                  options: options,
                });
                this.addFXMParticleEffect(name);
              } else if (effects[e].style === FXMStyleTypes.Filter) {
                log(false, 'Adding fxmaster: ' + name);
                await FXMASTER.filters.addFilter(name, effects[e].type, effects[e].options);
                await this.addFXMFilterEffect(name);
              }
            }
          }

          break;

        
        case 'off':
        default:
          break;
      }
    } 
  }

  // if skipCore is true, won't turn off the core weather; this is for when we're doing a deactivate that's 
  //    about to be followed by an activate.  Every scene update triggers a redraw so that creates an 
  //    infinite loop
  public async deactivateFX(skipCore: boolean = false): Promise<void> {
    if (isClientGM()) {
      if (!skipCore)
        await getGame().scenes?.active?.update({ weather: '' });

      // this isn't really safe because this is checking an internal setting but it's too easy to 
      //    get out of sync with FX master, in which case attempting to turn something off may actually
      //    add it instead
      // so we just turn off everything with the swr prefix
      // for (let i=0; i<this._activeFXMParticleEffects.length; i++) {
      //   const effectName = this._activeFXMParticleEffects[i];

      //   if (effectName in ((getGame().scenes?.active?.getFlag('fxmaster', 'effects') || []) as string[]))
      //     Hooks.call('fxmaster.switchParticleEffect', { name: this._activeFXMParticleEffects[i] });
      // }
      // update takes an array, but the ones we want to remove are stored in an object
      const filteredEffects = getGame().scenes?.active?.getFlag('fxmaster', 'effects') ?? {};
      const filteredEffectsArray = [] as any[];

      for (const key in filteredEffects) {
        if (!key.toString().startsWith('swr-'))
          filteredEffectsArray.push(filteredEffects[key]);
      }
      Hooks.call('fxmaster.updateParticleEffects', filteredEffectsArray);

      await this.clearFXMParticleEffects();
      
      for (let i=0; i<this._activeFXMFilterEffects.length; i++) {
        const effectName = this._activeFXMFilterEffects[i];

        await FXMASTER.filters.removeFilter(effectName);
      }
      await this.clearFXMFilterEffects();
    }
  }

  private async addFXMParticleEffect(name: string): Promise<void> {
    this._activeFXMParticleEffects.push(name);

    await moduleSettings.set(ModuleSettingKeys.activeFXMParticleEffects, this._activeFXMParticleEffects);
  }

  private async addFXMFilterEffect(name: string): Promise<void> {
    this._activeFXMFilterEffects.push(name);

    await moduleSettings.set(ModuleSettingKeys.activeFXMFilterEffects, this._activeFXMFilterEffects);
  }

  private async clearFXMParticleEffects(): Promise<void> {
    this._activeFXMParticleEffects = [];

    await moduleSettings.set(ModuleSettingKeys.activeFXMParticleEffects, this._activeFXMParticleEffects);
  }

  private async clearFXMFilterEffects(): Promise<void> {
    this._activeFXMFilterEffects = [];

    await moduleSettings.set(ModuleSettingKeys.activeFXMFilterEffects, this._activeFXMFilterEffects);
  }
}


export {
  weatherEffects,
  WeatherEffects,
  updateWeatherEffects
};