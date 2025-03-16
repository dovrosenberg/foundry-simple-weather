import sinon from 'sinon';
import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, HexFlowerCell, Humidity, Season } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';
import { WeatherData } from '@/weather/WeatherData';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { backupSettings, restoreSettings } from '@test/index';
import { GenerateWeather } from '@/weather/weatherGeneration';

let resetWeatherMock;  // reset to the 1st call
let dialogMockReturn: boolean = false;   // set this to determine the return value of the dialog prompt 

let weatherStub;
let dialogStub;

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
      const REFORECAST_OFFSET = 4;
      const reforecasts: Record<string, Forecast> = {};   // the forecasts that will be generated with the next 7 calls fo generateWeather
      for (let i = 0; i < 7; i++) {
        const timestamp = SimpleCalendar.api.dateToTimestamp({
          day: 15+i,
          month: 3,
          year: 2001, 
        });
        forecasts[timestamp] = new Forecast(timestamp, Climate.Temperate, Humidity.Modest, weather[i].hexFlowerCell as HexFlowerCell); 
        reforecasts[timestamp] = new Forecast(timestamp, Climate.Temperate, Humidity.Modest, weather[(i+REFORECAST_OFFSET) % weather.length].hexFlowerCell as HexFlowerCell); 
      }
        

      before(async () => {
        backupSettings();

        // mock generateWeather for testing forecasts
        let callCount = 0;
        resetWeatherMock = () => { callCount = 0;}
        weatherStub = sinon.stub(GenerateWeather, 'generateWeather').callsFake(
          (_climate: Climate, _humidity: Humidity, _season: Season, today: SimpleCalendar.DateData | null, _yesterday: WeatherData | null, _forForecast = false): WeatherData => {
            // update the date -- we start midway through the set to make sure they don't align with forecasts
            const weatherToReturn = weather[(REFORECAST_OFFSET + callCount++) % weather.length];
            weatherToReturn.date = today;
            return weatherToReturn;
          }
        );

        // mock for dialog prompt
        dialogStub = sinon.stub(Dialog, 'confirm').callsFake(() => dialogMockReturn);
      });

      beforeEach(async () => {
        resetWeatherMock();
      });

      describe('generateForecast', () => {
        it('should do nothing if todayWeather.climate/humidity/season are null', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);

          // test with a force overwrite so we can see if they change
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, null, Humidity.Modest, Climate.Temperate, 14, 14), false);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, null, Climate.Temperate, 14, 14), false);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, null, 14, 14), false);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);
        });

        it('should generate forecasts for the next 7 days', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, {});
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), false);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(reforecasts);
        });

        it('should overwrite if extendOnly==false', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), false);
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(reforecasts);
        });

        it('should prompt about overwrite when extendOnly set to true', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);  // make sure there are forecasts
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), true);
          expect(dialogStub.called).to.be.true;
        });

        it('should only fill in missing days when extendOnly==true and prompt is no', async () => {
          dialogMockReturn = false;
          
          const holeyForecasts = {...forecasts};
          const timestampToRemove = SimpleCalendar.api.dateToTimestamp({
            day: 15+3,
            month: 3,
            year: 2001, 
          });
  
          // remove a forecast
          delete holeyForecasts[timestampToRemove];
          await ModuleSettings.set(ModuleSettingKeys.forecasts, holeyForecasts);  

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), true);

          // fill back in the forecast (with the 1st weather used)
          holeyForecasts[timestampToRemove] = new Forecast(timestampToRemove, Climate.Temperate, Humidity.Modest, weather[REFORECAST_OFFSET].hexFlowerCell as HexFlowerCell); 
          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(holeyForecasts);          
        });

        it('should overwrite everything if extendOnly==true and prompt is yes', async () => {
          dialogMockReturn = true;
          
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);  
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), true);

          expect(await ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(reforecasts);          
        });

      });

      after(async () => {
        await restoreSettings();

        // clear mocks
        sinon.restore();      
      });
    }
  )
};
