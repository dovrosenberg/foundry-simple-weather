
// generate N days of forecast starting with tomorrow, based on today
// will overwrite any previously generated forecasts for those days

import { simpleCalendarInstalled } from '@/main';
import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Forecast } from './Forecast';
import { WeatherData } from './WeatherData';
import { generateWeather } from './weatherGeneration';

// returns the updated forecast object (to be saved to settings)
const generateForecast = function(todayTimestamp: number, todayWeather: WeatherData): Record<string, Forecast> {
  const numDays = 5;  // TODO: replace with a setting
  const currentForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
  let yesterdayWeather = todayWeather;

  for (let day=0; day<numDays; day++) {
    let forecastTimeStamp;

    if (simpleCalendarInstalled) {
      forecastTimeStamp = SimpleCalendar.api.timestampPlusInterval(todayTimestamp, { day: day});
    } else {
      forecastTimeStamp = todayTimestamp + day*24*60*60*1000;
    }

    if (todayWeather.climate===null || todayWeather.humidity===null || todayWeather.season===null)
      return currentForecasts;

    // create a new forecast
    const newWeather = generateWeather(todayWeather.climate, todayWeather.humidity, todayWeather.season, forecastDate, yesterdayWeather);

    if (newWeather.climate!=null && newWeather.humidity!=null && newWeather.hexFlowerCell!=null) {
      const forecast = new Forecast(newWeather.climate, newWeather.humidity, newWeather.hexFlowerCell);
      currentForecasts[forecastTimeStamp.toString()] = forecast;
    }

    // save the weather to use for the next day's generation
    yesterdayWeather = newWeather;
  }

  return currentForecasts;
};


export {
  generateForecast,
};