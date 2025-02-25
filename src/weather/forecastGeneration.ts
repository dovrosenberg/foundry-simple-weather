
// generate N days of forecast starting with tomorrow, based on today
// will overwrite any previously generated forecasts for those days

import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Forecast } from './Forecast';
import { WeatherData } from './WeatherData';
import { generateWeather } from './weatherGeneration';

// returns the updated forecast object (and saves it to settings)
// extendOnly is used to fill in needed days but not overwrite ones already generated
const generateForecast = async function(todayTimestamp: number, todayWeather: WeatherData, extendOnly = false): Promise<Record<string, Forecast>> {
  const numDays = 7;
  const currentForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);

  // XXX - is this right?
  if (todayWeather.climate===null || todayWeather.humidity===null || todayWeather.season===null)
    return currentForecasts;

  let yesterdayWeather = todayWeather;

  for (let day=1; day<=numDays; day++) {
    let forecastTimeStamp;

    forecastTimeStamp = SimpleCalendar.api.timestampPlusInterval(todayTimestamp, { day: day});

    // if there's already one, and we're just extending, use it as is
    if (currentForecasts[forecastTimeStamp] && extendOnly) {
      const todayWeather = currentForecasts[forecastTimeStamp];
      const todayDate = SimpleCalendar.api.timestampToDate(forecastTimeStamp);
      // XXX
      yesterdayWeather = new WeatherData(
        todayDate,
        todayDate?.currentSeason?.numericRepresentation || null,
        todayWeather.humidity, 
        todayWeather.climate,
        todayWeather.hexFlowerCell,
        null  
      );
    } else {
      // create a new forecast
      const newWeather = generateWeather(todayWeather.climate, todayWeather.humidity, todayWeather.season, SimpleCalendar.api.timestampToDate(forecastTimeStamp), yesterdayWeather, true);

      if (newWeather.climate!=null && newWeather.humidity!=null && newWeather.hexFlowerCell!=null) {
        const forecast = new Forecast(forecastTimeStamp, newWeather.climate, newWeather.humidity, newWeather.hexFlowerCell);
        currentForecasts[forecastTimeStamp] = forecast;
      }

      // save the weather to use for the next day's generation
      yesterdayWeather = newWeather;
    }
  }

  await ModuleSettings.set(ModuleSettingKeys.forecasts, currentForecasts);
  return currentForecasts;
};


export {
  generateForecast,
};