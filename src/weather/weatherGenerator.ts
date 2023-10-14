import { nextCell, startingCells, getDirection, weatherTemperatures, Direction, seasonSelections, climateSelections, humiditySelections, weatherDescriptions } from '@/weather/climateData';
import { moduleSettings, SettingKeys } from '@/settings/moduleSettings';
import { getGame, localize } from '@/utils/game';
import { Climate, Humidity, Season } from './climateData';
import { WeatherData } from './WeatherData';
import { log } from '@/utils/log';

// note: we don't actually care if the date on yesterday is the day before today; yesterday is used to determine if we should be picking a random
//    starting spot or moving from the prior one
// today is used to set the date on the returned object
const generate = function(climate: Climate, humidity: Humidity, season: Season, today: SimpleCalendar.DateData | null, yesterday: WeatherData | null): WeatherData {
  const weatherData = new WeatherData(today, season, humidity, climate, null, null);

  // do the generation
  if (!yesterday || yesterday.season !== season || !yesterday.hexFlowerCell) {
    // equal chances of any starting spot
    const startingSpot = Math.floor(Math.random()*startingCells[season].length);

    // no yesterday data (or starting a new season), so just pick a random starting point based on the season
    weatherData.hexFlowerCell = startingCells[season][startingSpot];
  } else {
    log(false, 'Generating weather');
    log(false, 'Season: ' + seasonSelections[season].text);
    log(false, 'Climate: ' + climateSelections[climate].text);
    log(false, 'Humidity: ' + humiditySelections[humidity].text);
    log(false, 'Current cell: ' + yesterday.hexFlowerCell + ' (' + weatherDescriptions[climate][humidity][yesterday.hexFlowerCell] + ')')

    // generate based on yesterday
    const direction = getDirection(season);
    log(false, 'Direction: ' + Direction[direction]);

    if (direction===Direction.stay) {
      weatherData.hexFlowerCell = yesterday.hexFlowerCell;
    } else {
      weatherData.hexFlowerCell = nextCell[season][yesterday.hexFlowerCell][direction];

      // a -1 means stay where we were
      if (weatherData.hexFlowerCell === -1) {
        weatherData.hexFlowerCell = yesterday.hexFlowerCell;
      }
    }

    log(false, 'New cell: ' + weatherData.hexFlowerCell + ' (' + weatherDescriptions[climate][humidity][weatherData.hexFlowerCell] + ')')
  }

  // randomize the temperature (+/- # degrees)
  // margin of error is 4% of temperature, but always at least 2 degrees
  weatherData.temperature = weatherTemperatures[climate][humidity][weatherData.hexFlowerCell];

  const plusMinus = Math.max(2, Math.ceil(.04*weatherData.temperature));
  weatherData.temperature += Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

  // Output to chat if enabled
  if (moduleSettings.get(SettingKeys.outputWeatherToChat)) {
    output(weatherData);
  }

  return weatherData;
};

const output = function(weatherData: WeatherData) {
  let messageRecipients: string[];

  if (moduleSettings.get(SettingKeys.publicChat)) {
    messageRecipients = getGame().users?.map((user) => user.id) || [];
  } else {
    messageRecipients = ChatMessage.getWhisperRecipients('GM')?.map((user) => user.id) || [];
  } 

  if (messageRecipients) {
    const chatOut = '<b>' + weatherData.getTemperature(moduleSettings.get(SettingKeys.useCelsius)) + '</b> - ' + weatherData.getDescription();

    ChatMessage.create({
      speaker: {
        alias: localize('sweath.weather.tracker.Today'),
      },
      whisper: messageRecipients,
      content: chatOut,
    });
  }
};

export {
  generate,
};