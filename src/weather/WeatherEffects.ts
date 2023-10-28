import { moduleSettings, SettingKeys } from '@/settings/moduleSettings';
import { getGame, isClientGM } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';
import { weatherOptions } from '@/weather/weatherMap';

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

    if (weatherData.climate === null || weatherData.humidity === null || weatherData.hexFlowerCell === null)
      return;

    console.log(false, 'Activating weather using: ' + this._useFX);

    if (this._fxActive) {
      switch (this._useFX) {
        case 'core':
          if (isClientGM()) {
            if (weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx?.core?.effect) 
              getGame().scenes?.active?.update({ weather: weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx.core.effect });
            else
              getGame().scenes?.active?.update({ weather: '' });
          }
          
          break;
        
        case 'off':
        default:
          getGame().scenes?.active?.update({ weather: '' });
          break;
      }
    } else {
      switch (this._useFX) {
        case 'core':
          if (isClientGM()) {
            getGame().scenes?.active?.update({ weather: '' });
          }
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
}

export {
  weatherEffects,
  WeatherEffects,
  updateWeatherEffects
};