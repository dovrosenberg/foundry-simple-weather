import { nextCell, startingCells, getDirection, weatherTemperatures, Direction, weatherDescriptions, } from '@/weather/weatherMap';
import { getManualOptionsBySeason } from '@/weather/manualWeather';
import { ModuleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import { localize } from '@/utils/game';
import { Climate, HexFlowerCell, Humidity, Season, } from './climateData';
import { WeatherData } from './WeatherData';
import { log } from '@/utils/log';
import { cleanDate } from '@/utils/calendar';
import { Forecast } from './Forecast';
import { calendarManager, CalendarType } from '@/calendar';
import { getCalendarAdapter, SimpleCalendarDate } from '@/calendar';

// structured it as a class to make it mockable for testing
export class GenerateWeather {
  // note: we don't actually care if the date on yesterday is the day before today; yesterday is used to determine if we should be picking a random
  //    starting spot or moving from the prior one
  // today is used to set the date on the returned object

  // forForecast indicates it's being generated as part of a re-forecast, so don't add more forecasts
  // forceRegenerate means to regenerate even if we have a valid forecast
  // isSingleDayAdvance means the date advanced by exactly one day, so we should auto-extend forecasts
  static generateWeather = async function(climate: Climate, humidity: Humidity, season: Season, today: SimpleCalendarDate | null, yesterday: WeatherData | null, forForecast = false, forceRegenerate = false, isSingleDayAdvance: boolean = false): Promise<WeatherData> {
    const weatherData = new WeatherData(today, season, humidity, climate, null, null);

    // do the generation
    log(false, 'Generating weather');
    log(false, 'Season: ' + Object.values(Season)[season]);
    log(false, 'Climate: ' + Object.values(Climate)[climate]);
    log(false, 'Humidity: ' + Object.values(Humidity)[humidity]);

    // if the date has a forecast, use that
    const allForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
    const todayForecast = today && allForecasts ? allForecasts[cleanDate(today)] ?? null : null;
    // see if we already have a valid forecast for today
    if (today && ModuleSettings.get(ModuleSettingKeys.useForecasts) && (todayForecast && !forceRegenerate) &&
        WeatherData.validateWeatherParameters(todayForecast.climate, todayForecast.humidity, todayForecast.hexFlowerCell)) {
      // make sure the climate/humidity hasn't changed
      if (climate===todayForecast.climate && humidity===todayForecast.humidity) {
        // just use the same weather we had before
        weatherData.hexFlowerCell = todayForecast.hexFlowerCell;  // we know this is good because of the validateWeatherParameters()
      } else {
        // we changed climate/humidity, so just pick a random starting point based on the season
        weatherData.hexFlowerCell = getDefaultStart(season);
      }

      // When using an existing forecast, we don't need to generate anything
      // The forecast window will naturally shift when the next day advances
    } else {
      // random start if no valid prior day or the prior day" was manually set or we changed season
      if (!yesterday || yesterday.season !== season || yesterday.hexFlowerCell==null || yesterday.manualOnly) {
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
          if (nextCell[season][yesterday.hexFlowerCell][direction]!==-1) {
            weatherData.hexFlowerCell = nextCell[season][yesterday.hexFlowerCell][direction] as HexFlowerCell;
          } else {
            // a -1 should never happen; if it does, something got screwy, so go to a default starting position
            weatherData.hexFlowerCell = getDefaultStart(season);
          }
        }
      }

      // generate an updated forecast
      if (!forForecast && ModuleSettings.get(ModuleSettingKeys.useForecasts) && today!==null) {
        // If this is a single day advance, use extendOnly mode to avoid prompting
        const extendOnly = isSingleDayAdvance;
        await GenerateWeather.generateForecast(cleanDate(today), weatherData, extendOnly);
      }

      log(false, 'New cell: ' + weatherData.hexFlowerCell + ' (' + weatherDescriptions[climate][humidity][weatherData.hexFlowerCell] + ')')
    }

    // randomize the temperature (+/- # degrees)
    // margin of error is 4% of temperature, but always at least 2 degrees
    weatherData.temperature = weatherTemperatures[climate][humidity][weatherData.hexFlowerCell as HexFlowerCell];

    const plusMinus = Math.max(2, Math.ceil(.04*weatherData.temperature));
    weatherData.temperature += Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

    return weatherData;
  };

  // used to create manual weather; returns null if data is invalid (weatherIndex in particular)
  static createManual = function(today: SimpleCalendarDate | null, season: Season, climate: Climate, humidity: Humidity, temperature: number, weatherIndex: number): WeatherData | null {
    const options = getManualOptionsBySeason(season, climate, humidity);   // get the details behind the option

    if (!options || !options[weatherIndex])
      return null;

    const option = options[weatherIndex];

    // randomize the temperature (+/- # degrees)
    // margin of error is 4% of temperature, but always at least 2 degrees
    const plusMinus = Math.max(2, Math.ceil(.04*temperature));
    const temp = temperature + Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

    const weatherData = new WeatherData(today, season, option.weather.humidity, option.weather.climate, option.weather.hexCell, temp);
    weatherData.manualOnly = option.valid;

    return weatherData;
  }

  // used to pick a specific cell for weather (for testing or use by other applications)
  static createSpecificWeather = function(today: SimpleCalendarDate | null, climate: Climate, humidity: Humidity, hexFlowerCell: HexFlowerCell): WeatherData | null {
    if (!WeatherData.validateWeatherParameters(climate, humidity, hexFlowerCell))
      throw new Error('Invalid parameters in createSpecificWeather()');

    let temp = weatherTemperatures[climate][humidity][hexFlowerCell];

    const plusMinus = Math.max(2, Math.ceil(.04*temp));
    temp += Math.floor(Math.random()*(2*plusMinus + 1) - plusMinus);

    const weatherData = new WeatherData(today, null, humidity, climate, hexFlowerCell, temp);
    weatherData.manualOnly = true;

    return weatherData;
  }

  /**
   * Outputs the current weather to the chat window. If the weather is manual, it
   * appends any custom chat message associated with the manual weather to the
   * end of the message.
   * @param weatherData the weather to output
   */
  static outputWeatherToChat = function(weatherData: WeatherData) {
    // get any custom text
    let chatOut = '<b>' + weatherData.getTemperature(ModuleSettings.get(ModuleSettingKeys.useCelsius)) + '</b> - ' + weatherData.getDescription();

    if (weatherData.climate!==null && weatherData.humidity!==null && weatherData.hexFlowerCell!==null) {
      const customText = ModuleSettings.get(ModuleSettingKeys.customChatMessages)[weatherData.climate][weatherData.humidity][weatherData.hexFlowerCell];
      if (customText)
        chatOut = chatOut + '<br>' + customText;
    }

    let dateOutput = '';
    if (ModuleSettings.get(ModuleSettingKeys.outputDateToChat)) {
      dateOutput = `${localize('chat.dateHeader')} ${weatherData.date?.display.date}:`;
    } else  {
      dateOutput = `${localize('chat.header')}:`;
    }

    ChatMessage.create({
      speaker: {
        alias: dateOutput,
      },
      whisper: ModuleSettings.get(ModuleSettingKeys.publicChat) ? undefined : ChatMessage.getWhisperRecipients('GM')?.map((user) => user.id) || [],
      content: chatOut,
    });
  };

  // generate N days of forecast starting with tomorrow, based on today
  // will overwrite any previously generated forecasts for those days
  // returns the updated forecast object (and saves it to settings)
  // if extendOnly is true, will only fill in missing ones; otherwise will prompt about overwriting if existing ones found and either skip or overwrite
  //    based on prompt response
  static generateForecast = async function(todayTimestamp: number, todayWeather: WeatherData, extendOnly: boolean): Promise<Record<string, Forecast>> {
    const numDays = 7;
    let currentForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);

    // if there's no calendar, don't do anything
    if (!calendarManager.hasActiveCalendar)
      return {};

    // if we don't have a climate or season, don't change the forecasts
    if (todayWeather.climate==null || todayWeather.humidity==null || todayWeather.season==null)
      return currentForecasts;

    let yesterdayWeather = todayWeather;

    // if there are any forecasts we're going to hit and we're in "extendOnly" mode, don't overwrite existing ones
    let shouldOverwrite = false;
    let startDay = 1;
    let daysToGenerate = [] as number[];
    
    if (extendOnly) {
      // When extending, we need to ensure we always have 7 days of forecasts
      // Remove any forecasts for days before today and fill gaps
      const calendarAdapter = getCalendarAdapter();
      if (calendarAdapter) {
        // First, remove any forecasts from before today (day 0 or negative)
        const cleanedForecasts: Record<string, Forecast> = {};
        for (const [timestamp, forecast] of Object.entries(currentForecasts)) {
          const forecastTimeStamp = parseInt(timestamp);
          // Only keep forecasts for days after today
          if (forecastTimeStamp > todayTimestamp) {
            cleanedForecasts[timestamp] = forecast;
          }
        }
        currentForecasts = cleanedForecasts;
        
        // Now check which days 1-7 need to be generated
        for (let day=1; day<=numDays; day++) {
          const forecastTimeStamp = calendarAdapter.timestampPlusInterval(todayTimestamp, { day: day});
          if (!currentForecasts[forecastTimeStamp]) {
            daysToGenerate.push(day);
          }
        }
      }
      // Never prompt when extending - just skip existing forecasts
      shouldOverwrite = false;
    } else {
      shouldOverwrite = true;
      daysToGenerate = Array.from({length: numDays}, (_, i) => i + 1);
    }

    for (const day of daysToGenerate) {
      const calendarAdapter = getCalendarAdapter();
      let forecastTimeStamp;
      if (calendarAdapter) {
        forecastTimeStamp = calendarAdapter.timestampPlusInterval(todayTimestamp, { day: day});
      }

      // Find yesterday's weather for this specific day
      let yesterdayWeatherForDay = yesterdayWeather;
      if (day > 1) {
        const yesterdayTimeStamp = calendarAdapter.timestampPlusInterval(todayTimestamp, { day: day - 1});
        if (currentForecasts[yesterdayTimeStamp]) {
          const yesterdayForecast = currentForecasts[yesterdayTimeStamp];
          const yesterdayDate = calendarAdapter.timestampToDate(yesterdayTimeStamp);
          
          if (WeatherData.validateWeatherParameters(yesterdayForecast.climate, yesterdayForecast.humidity, yesterdayForecast.hexFlowerCell)) {
            yesterdayWeatherForDay = new WeatherData(
              yesterdayDate,
              yesterdayDate?.currentSeason?.numericRepresentation || null,
              yesterdayForecast.humidity,
              yesterdayForecast.climate,
              yesterdayForecast.hexFlowerCell,
              null
            );
          }
        }
      }

      // create a new forecast
      let newWeather;
      if (calendarAdapter) {
        newWeather = await GenerateWeather.generateWeather(todayWeather.climate, todayWeather.humidity, todayWeather.season, calendarAdapter.timestampToDate(forecastTimeStamp), yesterdayWeatherForDay, true, true, false);
      }

      if (newWeather && newWeather.climate!=null && newWeather.humidity!=null && newWeather.hexFlowerCell!=null) {
        const forecast = new Forecast(forecastTimeStamp, newWeather.climate, newWeather.humidity, newWeather.hexFlowerCell);
        currentForecasts[forecastTimeStamp] = forecast;
        // Update yesterdayWeather for the next iteration
        yesterdayWeather = newWeather;
      }
    }

    await ModuleSettings.set(ModuleSettingKeys.forecasts, currentForecasts);
    return currentForecasts;
  };
}

// pick one of the valid starting cells at random
const getDefaultStart = function(season: Season) {
  const startingSpot = Math.floor(Math.random()*startingCells[season].length);

  return startingCells[season][startingSpot];
};
