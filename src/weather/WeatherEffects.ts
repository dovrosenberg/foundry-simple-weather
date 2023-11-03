import { moduleSettings, SettingKeys } from '@/settings/ModuleSettings';
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
  private _useFX: string;
  private _fxActive = true;
  private _lastWeatherData: WeatherData;   // we save it so we can toggle back on 
  private _activeFXParticleEffects: string[] = [];   // names of the active particle effects (so we can turn off)

  constructor() {
    this._fxActive = moduleSettings.get(SettingKeys.fxActive);
    this._useFX = moduleSettings.get(SettingKeys.useFX);
  }

  public set fxActive(active: boolean) {
    this._fxActive = active;

    this.activateFX(this._lastWeatherData);
  }

  public get fxActive(): boolean {
    return this._fxActive;
  }

  public activateFX = function(weatherData: WeatherData) {
    this._lastWeatherData = weatherData;

    if (!weatherData || weatherData.climate === null || weatherData.humidity === null || weatherData.hexFlowerCell === null)
      return;

    log(false, 'Activating weather using: ' + this._useFX);

    if (this._fxActive && isClientGM()) {
      switch (this._useFX) {
        case 'core':
          if (weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx?.core?.effect) 
            getGame().scenes?.active?.update({ weather: weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell].fx.core?.effect });
          else
            getGame().scenes?.active?.update({ weather: '' });
          
          break;

        case 'fxmaster':
          if (weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx?.fxMaster) {
            const effects = weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx?.fxMaster as FXDetail[];

            // note: because it uses hooks, we don't even need to check if the 
            //    module is present or the version is correct
            for (let e=0; e<effects.length; e++) {
              const name = this.getUniqueName(effects[e].type);
              Hooks.call('fxmaster.switchParticleEffect', {
                 name,
                 type: effects[e].type,
                 options: effects[e].options,
              });
              this._activeFXParticleEffects.push(name);
            }
          }

          for (let i=0; i<this._activeFXParticleEffects.length; i++) {
            Hooks.call('fxmaster.switchParticleEffect', { name: this._activeFXParticleEffects[i] });
          }
          
          this._activeFXParticleEffects = [];
          break;

        
        case 'off':
        default:
          getGame().scenes?.active?.update({ weather: '' });
          break;
      }
    } else {
      switch (this._useFX) {
        case 'core':
          getGame().scenes?.active?.update({ weather: '' });
          break;
        
        case 'fxmaster':
          // note: because it uses hooks, we don't even need to check if the 
          //    module is present or the version is correct
          for (let i=0; i<this._activeFXParticleEffects.length; i++)
            Hooks.call('fxmaster.switchParticleEffect', { name: this._activeFXParticleEffects[i] });
          this._activeFXParticleEffects = [];
          break;
        
        case 'off':
        default:
          break;
      }
    }
  }

  public deactivateFX = function(): void {
    switch (this._useFX) {
      case 'core':
        if (isClientGM()) {
          getGame().scenes?.active?.update({ weather: '' });
        }
        break;
      
      case 'off':
      default:
        // do nothing
    }     
  }

  private getUniqueName(type: string): string {
    const root = 'swr-' + type;
    let name: string;
  
    do {
      // just add the current milliseconds; if somehow we produce
      //    2 at the same time, just do it again;
      name = root + Date.now();
    } while (name in this._activeFXParticleEffects);
  
    return name;
  }
}


export {
  weatherEffects,
  WeatherEffects,
  updateWeatherEffects
};