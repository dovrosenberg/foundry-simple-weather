import { moduleSettings, SettingKeys } from '@/settings/moduleSettings';
import { getGame } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';

// the solo instance
let weatherEffects: WeatherEffects;

// set the main application; should only be called once
function updateWeatherEffects(effects: WeatherEffects): void {
  weatherEffects = effects;
}

class WeatherEffects {
  private _temp = false;

  public activateFX = function(weatherData: WeatherData) {
    switch (moduleSettings.get(SettingKeys.useFX)) {
      case 'core':
        if (this._temp) {
          getGame().scenes?.active?.update({ weather: 'snow' });
        } else {
          getGame().scenes?.active?.update({ weather: 'rain' });
        }
        this._temp = !this._temp;

        break;
      
      case 'off':
      default:
        // do nothing
    }
  }

  public deactivateFX = function(): void {
    switch (moduleSettings.get(SettingKeys.useFX)) {
      case 'core':
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