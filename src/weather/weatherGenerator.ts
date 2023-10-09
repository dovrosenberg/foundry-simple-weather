import { nextCell, startingCells, getDirection, weatherDescriptions, weatherTemperatures } from '@/weather/climateData';
import { createChat, getWhisperRecipients } from '@/chat/chatProxy';
import { ModuleSettings } from '@/settings/module-settings';
import { localize } from '@/utils/game';
import { Climate, Humidity, Season } from './climateData';
import { WeatherData } from './WeatherData';

const generate = function(settings: ModuleSettings, climate: Climate, humidity: Humidity, season: Season, yesterday: WeatherData | null): WeatherData {
  const weatherData = new WeatherData(null, season, humidity, climate, null, null);

  // do the generation
  if (!yesterday || yesterday.season !== season || !yesterday.hexFlowerCell) {
    // equal changes of any starting spot
    const startingSpot = Math.floor(Math.random()*startingCells[season].length);

    // no yesterday data (or starting a new season), so just pick a random starting point based on the season
    weatherData.hexFlowerCell = startingCells[season][startingSpot];
  } else {
    // generate based on yesterday
    const direction = getDirection(season);

    weatherData.hexFlowerCell = nextCell[season][yesterday.hexFlowerCell][direction];

    // a -1 means stay where we were
    if (weatherData.hexFlowerCell === -1) {
      weatherData.hexFlowerCell = yesterday.hexFlowerCell;
    }
  }

  // randomize the temperature (+/- # degrees)
  // margin of error is 4% of temperature, but always at least 2 degrees
  weatherData.temperature = weatherTemperatures[climate][humidity][weatherData.hexFlowerCell];

  const plusMinus = Math.max(2, Math.ceil(.04*weatherData.temperature));
  weatherData.temperature += Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

  // Output to chat if enabled
  if (settings.getOutputWeatherToChat()) {
    output(settings, weatherData);
  }

  return weatherData;
};

const output = function(settings: ModuleSettings, weatherData: WeatherData) {
  let messageRecipients = '';

  messageRecipients = getWhisperRecipients('GM')[0].id || '';

  if (messageRecipients) {
    const chatOut = '<b>' + weatherData.getTemperature(settings.getUseCelsius()) + '</b> - ' + weatherData.getDescription();

    createChat({
      speaker: {
        alias: localize('sweath.weather.tracker.Today'),
      },
      whisper: [messageRecipients],
      content: chatOut,
    });
  }
};

export {
  generate,
};