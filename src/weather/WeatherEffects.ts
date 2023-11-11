import { ModuleSettings, moduleSettings, SettingKeys } from '@/settings/ModuleSettings';
import { getGame, isClientGM } from '@/utils/game';
import { log } from '@/utils/log';
import { WeatherData } from '@/weather/WeatherData';
import { weatherOptions } from '@/weather/weatherMap';
import { FXDetail } from './effectsMap';

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
  private _activeFXParticleEffects: string[] = [];   // names of the active particle effects (so we can turn off)

  constructor() {
    this._fxActive = moduleSettings.get(SettingKeys.fxActive);
    this._useFX = moduleSettings.get(SettingKeys.useFX);
    this._activeFXParticleEffects = moduleSettings.get(SettingKeys.activeFXParticleEffects);
    this._sceneReady = false;
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

  public activateFX(weatherData: WeatherData): void {
    this._lastWeatherData = weatherData;

    if (!this._sceneReady)
      return;

    if (!weatherData || weatherData.climate === null || weatherData.humidity === null || weatherData.hexFlowerCell === null)
      return;

    const effectOptions = weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell].fx;

    log(false, 'Activating weather using: ' + this._useFX);

    if (isClientGM()) {
      // turn off any old ones
      this.deactivateFX();

      if (!effectOptions)  // no fx specified
        return;

      switch (this._useFX) {
        case 'core':
          if (effectOptions.core?.effect) 
            getGame().scenes?.active?.update({ weather: effectOptions.core?.effect });
          break;

        case 'fxmaster':
          if (effectOptions.fxMaster) {
            const effects = effectOptions.fxMaster as FXDetail[];

            // note: because it uses hooks, we don't even need to check if the module is present or the version is correct
            // TODO... uh - actually do need to check version
            for (let e=0; e<effects.length; e++) {
              const name = `swr-${effects[e].type}-${foundry.utils.randomID()}`;

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
              this.addFXParticleEffect(name);
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
    switch (this._useFX) {
      case 'core':
        if (isClientGM()) {
          getGame().scenes?.active?.update({ weather: '' });
        }
        break;
      
      case 'fxmaster':
        // note: because it uses hooks, we don't even need to check if the module is present or the version is correct
        // TODO: actually we do need to check the version
        // this isn't really safe because this is checking an internal setting but it's too easy to 
        //    get out of sync with FX master, in which case attempting to turn something off may actually
        //    add it instead
        for (let i=0; i<this._activeFXParticleEffects.length; i++) {
          const effectName = this._activeFXParticleEffects[i];

          if (effectName in (getGame().scenes?.active?.getFlag('fxmaster', 'effects') as string[]))
            Hooks.call('fxmaster.switchParticleEffect', { name: this._activeFXParticleEffects[i] });
        }
        this.clearFXParticleEffects();

        break;

      case 'off':
      default:
        // do nothing
    }     
  }

  private addFXParticleEffect(name: string): void {
    this._activeFXParticleEffects.push(name);

    moduleSettings.set(SettingKeys.activeFXParticleEffects, this._activeFXParticleEffects);
  }

  private clearFXParticleEffects(): void {
    this._activeFXParticleEffects = [];

    moduleSettings.set(SettingKeys.activeFXParticleEffects, this._activeFXParticleEffects);
  }
}


export {
  weatherEffects,
  WeatherEffects,
  updateWeatherEffects
};