import { ModuleSettings, moduleSettings, SettingKeys } from '@/settings/ModuleSettings';
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
    this._fxActive = moduleSettings.get(SettingKeys.fxActive);
    this._useFX = moduleSettings.get(SettingKeys.useFX);

    // check the version
    if (this._useFX==='fxmaster') {
      const fxVersion = getGame().modules.get('fxmaster')?.version;

      if (!fxVersion || !getGame().modules.get('fxmaster')?.active) {
        // module is missing... but they picked it so just disable for now
        this._useFX = 'off';
        log(false, 'Disabling FXMaster because module not present');
      } else if (fxVersion!=='3.0.0' && !VersionUtils.isMoreRecent(fxVersion, '3.0.0')) {
        ui.notifications?.error('FX Master found, but version prior to v3.0.0. Make sure the latest version of FX Master is installed to use for weather effects.');
        ui.notifications?.error('Version found: ' + fxVersion);
      }
    }

    this._activeFXMParticleEffects = moduleSettings.get(SettingKeys.activeFXMParticleEffects);
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
    this.deactivateFX();

    if (weatherData)
      this.activateFX(weatherData);
    else if (this._lastWeatherData)
      this.activateFX(this._lastWeatherData);
  };

  public set fxActive(active: boolean) {
    this._fxActive = active;

    if (active)
      this.activateFX(this._lastWeatherData);
    else  
      this.deactivateFX();
  }

  public get fxActive(): boolean {
    return this._fxActive;
  }

  // need to turn any old ones off separately first...
  public activateFX(weatherData: WeatherData): void {
    this._lastWeatherData = weatherData;

    if (!this._sceneReady)
      return;

    if (!weatherData || weatherData.climate === null || weatherData.humidity === null || weatherData.hexFlowerCell === null)
      return;

    const effectOptions = weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell].fx;

    if (isClientGM()) {
      if (!effectOptions)
        return;

      switch (this._useFX) {
        case 'core':
          if (effectOptions.core?.effect) 
            getGame().scenes?.active?.update({ weather: effectOptions.core?.effect });
          break;

        case 'fxmaster':
          // turn off any old ones
          this.deactivateFX();

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
                FXMASTER.filters.addFilter(name, effects[e].type, effects[e].options);
                this.addFXMFilterEffect(name);
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

  public deactivateFX(): void {
    if (isClientGM()) {
      switch (this._useFX) {
        case 'core':
          if (isClientGM()) {
            getGame().scenes?.active?.update({ weather: '' });
          }
          break;
        
        case 'fxmaster':
          // this isn't really safe because this is checking an internal setting but it's too easy to 
          //    get out of sync with FX master, in which case attempting to turn something off may actually
          //    add it instead
          for (let i=0; i<this._activeFXMParticleEffects.length; i++) {
            const effectName = this._activeFXMParticleEffects[i];

            if (effectName in ((getGame().scenes?.active?.getFlag('fxmaster', 'effects') || []) as string[]))
              Hooks.call('fxmaster.switchParticleEffect', { name: this._activeFXMParticleEffects[i] });
          }
          this.clearFXMParticleEffects();
          
          for (let i=0; i<this._activeFXMFilterEffects.length; i++) {
            const effectName = this._activeFXMFilterEffects[i];

            FXMASTER.filters.removeFilter(effectName);
          }
          this.clearFXMFilterEffects();

          break;

        case 'off':
        default:
          // do nothing
      }     
    }
  }

  private addFXMParticleEffect(name: string): void {
    this._activeFXMParticleEffects.push(name);

    moduleSettings.set(SettingKeys.activeFXMParticleEffects, this._activeFXMParticleEffects);
  }

  private addFXMFilterEffect(name: string): void {
    this._activeFXMFilterEffects.push(name);

    moduleSettings.set(SettingKeys.activeFXMFilterEffects, this._activeFXMFilterEffects);
  }

  private clearFXMParticleEffects(): void {
    this._activeFXMParticleEffects = [];

    moduleSettings.set(SettingKeys.activeFXMParticleEffects, this._activeFXMParticleEffects);
  }

  private clearFXMFilterEffects(): void {
    this._activeFXMFilterEffects = [];

    moduleSettings.set(SettingKeys.activeFXMFilterEffects, this._activeFXMFilterEffects);
  }
}


export {
  weatherEffects,
  WeatherEffects,
  updateWeatherEffects
};