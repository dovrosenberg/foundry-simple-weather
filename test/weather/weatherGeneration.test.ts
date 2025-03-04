import sinon from 'sinon';
import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, HexFlowerCell, Humidity, Season } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';
import { WeatherData } from '@/weather/WeatherData';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { backupSettings, restoreSettings } from '@test/index';
import { GenerateWeather } from '@/weather/weatherGeneration';

let generateWeatherMock;

export const registerWeatherGenerationTests = () => {
  quench.registerBatch(
    'simple-weather.weather.forecastGeneration',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after, } = context;
      const todayTimestamp = SimpleCalendar.api.dateToTimestamp({
        day: 14,
        month: 3,
        year: 2001,
      });
      const todayDate = SimpleCalendar.api.timestampToDate(todayTimestamp);

      if (!todayTimestamp) throw new Error('could not generate test date');

      const weather: WeatherData[] = [
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 17, 70),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 18, 71),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 16, 72),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 17, 73),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 12, 74),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 19, 75),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 18, 76),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 16, 77),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 17, 78),
      ];

      const forecasts: Record<string, Forecast> = {};
      for (let i = 0; i < 7; i++) {
        const timestamp = SimpleCalendar.api.dateToTimestamp({
          day: 14+i,
          month: 3,
          year: 2001, 
        });
        forecasts[timestamp] = new Forecast(timestamp, Climate.Temperate, Humidity.Modest, weather[i].hexFlowerCell as HexFlowerCell); 
      }
        

      before(async () => {
        backupSettings();

        // mock generateWeather for testing forecasts
        let callCount = 0;
        generateWeatherMock = (_climate: Climate, _humidity: Humidity, _season: Season, today: SimpleCalendar.DateData | null, _yesterday: WeatherData | null, _forForecast = false): WeatherData => {
          callCount++;

          // update the date
          const weatherToReturn = weather[(callCount-1) % weather.length];
          weatherToReturn.date = today;
          return weatherToReturn;
        }
      });

      describe('generateForecast', () => {
        it('should do nothing if todayWeather.climate/humidity/season are null', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);

          GenerateWeather.generateForecast(todayTimestamp, weather[0], true);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          GenerateWeather.generateForecast(todayTimestamp, weather[0], false);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);
        });

        it('should generate forecasts for the next 7 days', async () => {
          const stub = sinon.stub(GenerateWeather, 'generateWeather').callsFake(generateWeatherMock);

          // test with no forecasts

          // test with forecasts
          expect(0).to.equal(0);

          // test with only some forecasts

          // restore the mock
          stub.restore();
        });

        it('should not overwrite when extendOnly set to true', async () => {
        });

        it('should overwrite when extendOnly set to false', async () => {
        });

      });

      after(async () => {
        await restoreSettings();

        // clear mocks
        generateWeatherStub.restore();      
      });
    }
  )
};
