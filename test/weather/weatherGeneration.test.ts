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

      // this is used to prepopulate forecasts with known values
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

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(
            weather[0].date, 
            weather[0].season, 
            weather[0].humidity, 
            null, 
            weather[0].hexFlowerCell, 
            weather[0].temperature,
          ), true);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(
            weather[0].date, 
            weather[0].season, 
            null, 
            weather[0].climate, 
            weather[0].hexFlowerCell, 
            weather[0].temperature,
          ), true);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(
            weather[0].date, 
            null, 
            weather[0].humidity, 
            weather[0].climate, 
            weather[0].hexFlowerCell, 
            weather[0].temperature,
          ), true);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);
        });

        it('should generate forecasts for the next 7 days', async () => {
          const stub = sinon.stub(GenerateWeather, 'generateWeather').callsFake(generateWeatherMock);

          // test with no forecasts
          await ModuleSettings.set(ModuleSettingKeys.forecasts, {});
          let forecasts = await GenerateWeather.generateForecast(todayTimestamp, weather[0], true);
          expect(Object.keys(forecasts).length).to.equal(7);
          for (let i=0; i<7; i++) {
            // make sure the key is the timestamp
            expect(forecasts[Object.keys(forecasts)[i]].timestamp.toString()).to.equal(Object.keys(forecasts)[i]);

            // make sure the forecast is correct
            expect(forecasts[Object.keys(forecasts)[i]]).to.deep.equal(new Forecast(
              SimpleCalendar.api.timestampPlusInterval(todayTimestamp, { day: i+1 }),
              weather[i].climate as Climate,
              weather[i].humidity as Humidity,
              weather[i].hexFlowerCell as HexFlowerCell,
            ));
          }

          // test with only some forecasts - don't use the the ones in the right order
          //    because then we can't tell if they're overwritten or not
          await ModuleSettings.set(ModuleSettingKeys.forecasts, {
            [forecasts[0].timestamp.toString()]: new Forecast(forecasts[0].timestamp,forecasts[4].climate, forecasts[4].humidity, forecasts[4].hexFlowerCell),
            [forecasts[1].timestamp.toString()]: new Forecast(forecasts[1].timestamp,forecasts[5].climate, forecasts[5].humidity, forecasts[5].hexFlowerCell),
            [forecasts[2].timestamp.toString()]: new Forecast(forecasts[2].timestamp,forecasts[6].climate, forecasts[6].humidity, forecasts[6].hexFlowerCell),
          });
          forecasts = await GenerateWeather.generateForecast(todayTimestamp, weather[0], true);
          expect(Object.keys(forecasts).length).to.equal(7);

          // the first 3 should match above
          for (let i=0; i<3; i++) {
            // make sure the key is the timestamp
            expect(forecasts[Object.keys(forecasts)[i]].timestamp.toString()).to.equal(Object.keys(forecasts)[i]);

            // make sure the forecast is correct
            expect(forecasts[Object.keys(forecasts)[i]]).to.deep.equal(new Forecast(
              SimpleCalendar.api.timestampPlusInterval(todayTimestamp, { day: i+1 }),
              weather[4+i].climate as Climate,
              weather[4+i].humidity as Humidity,
              weather[4+i].hexFlowerCell as HexFlowerCell,
            ));
          }

          // the last 4 should match weather[0..3]
          for (let i=3; i<7; i++) {
            // make sure the key is the timestamp
            expect(forecasts[Object.keys(forecasts)[i]].timestamp.toString()).to.equal(Object.keys(forecasts)[i]);

            // make sure the forecast is correct
            expect(forecasts[Object.keys(forecasts)[i]]).to.deep.equal(new Forecast(
              SimpleCalendar.api.timestampPlusInterval(todayTimestamp, { day: i+1 }),
              weather[i-3].climate as Climate,
              weather[i-3].humidity as Humidity,
              weather[i-3].hexFlowerCell as HexFlowerCell,
            ));
          }

          // if all 7 forecasts are there, they shouldn't change
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);
          await GenerateWeather.generateForecast(todayTimestamp, weather[0], true);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

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
