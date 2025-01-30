import { weatherApplication } from '@/applications/WeatherApplication';
import { ModuleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import { SceneSettingKeys, SceneSettings } from '@/settings/SceneSettings';
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
  public firstRefresh: boolean;  // is this the first refresh of fxActive after scene becomes ready?
  private _useFX: string;
  private _fxActive: boolean;
  private _lastWeatherData: WeatherData;   // we save it so we can toggle back on 
  private _activeFXMParticleEffects: string[] = [];   // names of the active particle effects (so we can turn off)
  private _activeFXMFilterEffects: string[] = [];   // names of the active filter effects (so we can turn off)

  constructor() {
    if (ModuleSettings.get(ModuleSettingKeys.FXByScene)) {
      this._fxActive = false;  // scene probably isn't ready... so need to recheck once it is
    } else {
      this._fxActive = ModuleSettings.get(ModuleSettingKeys.fxActive);
    }
    this._useFX = ModuleSettings.get(ModuleSettingKeys.useFX);

    // check the version
    if (this._useFX==='fxmaster') {
      const fxVersion = getGame().modules.get('fxmaster')?.version;

      if (!fxVersion || !getGame().modules.get('fxmaster')?.active) {
        // module is missing... but they picked it so just disable for now
        this._useFX = 'off';
        ui.notifications?.error('Disabling FXMaster because module not present');
      } else if (fxVersion!=='3.0.0' && !VersionUtils.isMoreRecent(fxVersion, '3.0.0')) {
        if (isClientGM()) {
          ui.notifications?.error('FX Master found, but version prior to v3.0.0. Make sure the latest version of FX Master is installed to use for weather effects.');
          ui.notifications?.error('Version found: ' + fxVersion);
        }
      }
    }

    this._activeFXMParticleEffects = ModuleSettings.get(ModuleSettingKeys.activeFXMParticleEffects);
    this._sceneReady = false;
    this.firstRefresh = true;
  }

  // are we using any special effects?
  public get useFX(): boolean {
    return (this._useFX !== 'off');
  }

  // call when the scene is ready
  public ready(weatherData: WeatherData | null): void {
    this._sceneReady = true;

    if (weatherData)
      this.activateFX(weatherData);
    else if (this._lastWeatherData)
      this.activateFX(this._lastWeatherData);
  };

  public async setFxActive(active: boolean) {
    if (!this.firstRefresh && (!this._sceneReady || this._fxActive===active))
      return;

    this.firstRefresh = false;
    this._fxActive = active;

    // save to the module or scene settings
    if (ModuleSettings.get(ModuleSettingKeys.FXByScene)) {
      await SceneSettings.set(SceneSettingKeys.fxActive, active);
    } else {
      await ModuleSettings.set(ModuleSettingKeys.fxActive, active);
    }

    if (active) {
      await this.activateFX(this._lastWeatherData);
    } else {
      await this.deactivateFX();
    }

    // need to rerender the application to update the toggle button
    weatherApplication.render();
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

      // turn off any old ones
      await this.deactivateFX(this._useFX === 'core');

      if (!this._fxActive)
        return;
  
      const effectOptions = weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell].fx;

      if (!effectOptions)
        return;

      switch (this._useFX) {
        case 'core':
          await SceneSettings.currentScene?.update({ weather: effectOptions.core?.effect || '' });
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

                // Hooks.call('fxmaster.switchParticleEffect', {
                //   name,
                //   type: effects[e].type,
                //   options: options,
                // });

                // const newEffects = SceneSettings.currentScene?.getFlag('fxmaster', 'effects') ?? {};
                // newEffects[name] = {
                //   type: effects[e].type,
                //   options: options,
                // };

                // await canvas?.scene?.setFlag('fxmaster', 'effects', newEffects);

                this.addFXMParticleEffect(name);
              } else if (effects[e].style === FXMStyleTypes.Filter) {
                log(false, 'Adding fxmaster: ' + name);
                await FXMASTER.filters.addFilter(name, effects[e].type, effects[e].options);
                await this.addFXMFilterEffect(name);
              }

              // force everything to draw immediately
              // getGame().canvas.fxmaster?.drawParticleEffects({ soft: false });
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
        await SceneSettings.currentScene?.update({ weather: '' });

      if (getGame().modules.get('fxmaster')?.active) {
        // this isn't really safe because this is checking an internal setting but it's too easy to 
        //    get out of sync with FX master, in which case attempting to turn something off may actually
        //    add it instead
        // update takes an array, but the ones we want to remove are stored in an object
        const filteredEffects = SceneSettings.currentScene?.getFlag('fxmaster', 'effects') ?? {};

        // this is how we should do it - but there's an async issue with fxmaster that's causing the scene to take forever to update (because
        //   the flag isn't being updated until after the initial scene update) - until that's fixed, we are manually doing what the fxmaster hook should do
        /*
          // sometimes deactivate gets called multiple times before fxmaster has processed all of them (since we can't await)
          // when that happens, it ends up adding effects with just the name set; not sure we can do much there except
          //    pull them out again later, but it's causing a warning to be thrown by fxmaster (but no other issues)
          for (let key in filteredEffects) {
            if (key.toString().startsWith('swr-')) { 
              Hooks.call('fxmaster.switchParticleEffect', { name: key });
            }
          }
        */

        let newEffects = {};
        for (let key in filteredEffects) {
          if (!key.toString().startsWith('swr-')) 
            newEffects[key] = filteredEffects[key];
          else 
            newEffects[`-=${key.toString()}`] = null;
        }

        await canvas?.scene?.setFlag('fxmaster', 'effects', newEffects);
      }
      
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

    await ModuleSettings.set(ModuleSettingKeys.activeFXMParticleEffects, this._activeFXMParticleEffects);
  }

  private async addFXMFilterEffect(name: string): Promise<void> {
    this._activeFXMFilterEffects.push(name);

    await ModuleSettings.set(ModuleSettingKeys.activeFXMFilterEffects, this._activeFXMFilterEffects);
  }

  private async clearFXMParticleEffects(): Promise<void> {
    this._activeFXMParticleEffects = [];

    await ModuleSettings.set(ModuleSettingKeys.activeFXMParticleEffects, this._activeFXMParticleEffects);
  }

  private async clearFXMFilterEffects(): Promise<void> {
    this._activeFXMFilterEffects = [];

    await ModuleSettings.set(ModuleSettingKeys.activeFXMFilterEffects, this._activeFXMFilterEffects);
  }
}


export {
  weatherEffects,
  WeatherEffects,
  updateWeatherEffects
};