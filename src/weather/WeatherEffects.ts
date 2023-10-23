import { moduleSettings, SettingKeys } from '@/settings/moduleSettings';
import { getGame } from '@/utils/game';
import { WeatherData } from '@/weather/WeatherData';
import { weatherOptions } from '@/weather/weatherMap';

// the solo instance
let weatherEffects: WeatherEffects;

// set the main application; should only be called once
function updateWeatherEffects(effects: WeatherEffects): void {
  weatherEffects = effects;
}

class WeatherEffects {
  public activateFX = function(weatherData: WeatherData) {
    if (weatherData.climate === null || weatherData.humidity === null || weatherData.hexFlowerCell === null)
      return;

    console.log(false, 'Activating weather using: ' + moduleSettings.get(SettingKeys.useFX));

    switch (moduleSettings.get(SettingKeys.useFX)) {
      case 'core':
        if (weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx?.core?.effect)
          getGame().scenes?.active?.update({ weather: weatherOptions[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell]?.fx.core.effect });
          getGame().scenes?.active?.update({ weather: '' });

        break;
      
      case 'off':
      default:
        // do nothing
        // TODO!!! TURN OFF ANY EFFECTS FROM ALL THE OTHER SYSTEMS
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