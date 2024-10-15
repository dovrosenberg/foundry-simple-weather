import { nextCell, startingCells, getDirection, weatherTemperatures, Direction, weatherDescriptions, manualOptions } from '@/weather/weatherMap';
import { ModuleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import { localize } from '@/utils/game';
import { Climate, Humidity, Season, seasonSelections } from './climateData';
import { WeatherData } from './WeatherData';
import { log } from '@/utils/log';
import { generateForecast } from './forecastGeneration';

// note: we don't actually care if the date on yesterday is the day before today; yesterday is used to determine if we should be picking a random
//    starting spot or moving from the prior one
// today is used to set the date on the returned object

// forForecast indicates
const generateWeather = function(climate: Climate, humidity: Humidity, season: Season, today: SimpleCalendar.DateData | null, yesterday: WeatherData | null, forForecast = false): WeatherData {
  const weatherData = new WeatherData(today, season, humidity, climate, null, null);

  // do the generation
  log(false, 'Generating weather');
  log(false, 'Season: ' + Object.values(Season)[season]);
  log(false, 'Climate: ' + Object.values(Climate)[climate]);
  log(false, 'Humidity: ' + Object.values(Humidity)[humidity]);

  // if the date has a forecast, use that
  const allForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
  if (today && ModuleSettings.get(ModuleSettingKeys.useForecasts) && allForecasts && 
      allForecasts[SimpleCalendar.api.dateToTimestamp(today)]) {
    const forecast = allForecasts[SimpleCalendar.api.dateToTimestamp(today)];

    // make sure the climate/humidity hasn't changed
    if (climate===forecast.climate && humidity===forecast.humidity) {
      weatherData.hexFlowerCell = forecast.hexFlowerCell;

      // we need to generate one more day on the end
      generateForecast(SimpleCalendar.api.dateToTimestamp(today), weatherData, true);
    }
  } else {
    // random start if no valid prior day or the prior day" was manually set
    if (!yesterday || yesterday.season !== season || !yesterday.hexFlowerCell || yesterday.isManual) {
      // no yesterday data (or starting a new season), so just pick a random starting point based on the season
      weatherData.hexFlowerCell = getDefaultStart(season);
    } else {
      log(false, 'Current cell: ' + yesterday.hexFlowerCell + ' (' + weatherDescriptions[climate][humidity][yesterday.hexFlowerCell] + ')')

      // generate based on yesterday
      const direction = getDirection(season);
      log(false, 'Direction: ' + Direction[direction]);

      if (direction===Direction.stay) {
        weatherData.hexFlowerCell = yesterday.hexFlowerCell;
      } else {
        weatherData.hexFlowerCell = nextCell[season][yesterday.hexFlowerCell][direction];

        // a -1 should never happen; if it does, something got screwy, so go to a default starting position
        if (weatherData.hexFlowerCell === -1) {
          weatherData.hexFlowerCell = weatherData.hexFlowerCell = getDefaultStart(season);
        }
      }
    }

    // generate an updated forecast
    if (!forForecast && ModuleSettings.get(ModuleSettingKeys.useForecasts) && today!==null) {
      generateForecast(SimpleCalendar.api.dateToTimestamp(today), weatherData);
    }

    log(false, 'New cell: ' + weatherData.hexFlowerCell + ' (' + weatherDescriptions[climate][humidity][weatherData.hexFlowerCell] + ')')
  }

  // randomize the temperature (+/- # degrees)
  // margin of error is 4% of temperature, but always at least 2 degrees
  weatherData.temperature = weatherTemperatures[climate][humidity][weatherData.hexFlowerCell as number];

  const plusMinus = Math.max(2, Math.ceil(.04*weatherData.temperature));
  weatherData.temperature += Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

  return weatherData;
};

// used to create manual weather; returns null if data is invalid (weatherIndex in particular)
const createManual = function(today: SimpleCalendar.DateData | null, temperature: number, weatherIndex: number): WeatherData | null {
  const options = manualOptions[weatherIndex];   // get the details behind the option

  if (!options)
    return null;

  // randomize the temperature (+/- # degrees)
  // margin of error is 4% of temperature, but always at least 2 degrees
  const plusMinus = Math.max(2, Math.ceil(.04*temperature));
  const temp = temperature + Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

  const weatherData = new WeatherData(today, null, options.humidity, options.climate, options.hexCell, temp);
  weatherData.isManual = true;

  return weatherData;
}

// used to pick a specific cell for weather (for testing or use by other applications)
const createSpecificWeather = function(today: SimpleCalendar.DateData | null, climate: Climate, humidity: Humidity, hexFlowerCell: number): WeatherData | null {
  let temp = weatherTemperatures[climate][humidity][hexFlowerCell];

  const plusMinus = Math.max(2, Math.ceil(.04*temp));
  temp += Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

  const weatherData = new WeatherData(today, null, humidity, climate, hexFlowerCell, temp);
  weatherData.isManual = true;

  return weatherData;
}

const outputWeather = function(weatherData: WeatherData) {
  // get any custom text
  let chatOut = '<b>' + weatherData.getTemperature(ModuleSettings.get(ModuleSettingKeys.useCelsius)) + '</b> - ' + weatherData.getDescription();

  if (weatherData.climate!==null && weatherData.humidity!==null && weatherData.hexFlowerCell!==null) {
    const customText = ModuleSettings.get(ModuleSettingKeys.customChatMessages)[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell];
    if (customText)
      chatOut = chatOut + '<br>' + customText;
  }

  ChatMessage.create({
    speaker: {
      alias: localize('sweath.chat.header'),
    },
    whisper: ModuleSettings.get(ModuleSettingKeys.publicChat) ? undefined : ChatMessage.getWhisperRecipients('GM')?.map((user) => user.id) || [],
    content: chatOut,
  });
};

// pick one of the valid starting cells at random
const getDefaultStart = function(season: Season) {
  const startingSpot = Math.floor(Math.random()*startingCells[season].length);

  return startingCells[season][startingSpot];
};

export {
  generateWeather,
  outputWeather,
  createManual,
  createSpecificWeather
};