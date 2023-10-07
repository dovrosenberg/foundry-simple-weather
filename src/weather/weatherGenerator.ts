import { nextCell, startingCells, getDirection } from '@/weather/climateData';
import { createChat, getWhisperRecipients } from '@/chat/chatProxy';
import { ModuleSettings } from '@/settings/module-settings';
import { localize } from '@/utils/game';
import { Climate, Humidity, WeatherData, Season } from './WeatherData';

const generate = function(settings: ModuleSettings, climate: Climate, humidity: Humidity, season: Season, yesterday: WeatherData | null): WeatherData {
  const weatherData = new WeatherData();
  weatherData.climate = climate;
  weatherData.humidity = humidity;
  weatherData.season = season;

  // do the generation
  if (!yesterday || yesterday.season !== season) {
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

  // randomize the temperature (+/-2 degrees)
  weatherData.temperature += Math.floor(Math.random()*5 - 2);

  // Output to chat if enabled
  if (settings.getOutputWeatherToChat()) {
    output(weatherData);
  }

  return weatherData;
};

const output = function(weatherData: WeatherData) {
  let messageRecipients = '';

  messageRecipients = getWhisperRecipients('GM')[0].id || '';

  if (messageRecipients) {
    const chatOut = '<b>' + weatherData.getTemperature(this.settings.getUseCelsius()) + '</b> - ' + weatherData.getDescription();

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
}