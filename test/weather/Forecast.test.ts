import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, Humidity } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';
import { weatherDescriptions, weatherSunniness, weatherTemperatures } from '@/weather/weatherMap';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { backupSettings, restoreSettings } from '@test/index';

export const registerForecastTests = () => {
  quench.registerBatch(
    'simple-weather.weather.Forecast',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after, } = context;
      const timestamp = SimpleCalendar.api.dateToTimestamp({
        day: 14,
        month: 3,
        year: 2001,
      });

      before(() => {
        backupSettings();
      });

      describe('get sunniness', () => {
        it('should return proper string', () => {

          const forecast1 = new Forecast(timestamp, Climate.Cold, Humidity.Barren, 15);
          expect(forecast1.sunniness).to.equal(weatherSunniness[Climate.Cold][Humidity.Barren][15]);
          
          const forecast2 = new Forecast(timestamp, Climate.Hot, Humidity.Modest, 12);
          expect(forecast2.sunniness).to.equal(weatherSunniness[Climate.Hot][Humidity.Modest][12]);
        });
      });

      describe('get description', () => {
        it('should return proper string', () => {

          const forecast1 = new Forecast(timestamp, Climate.Cold, Humidity.Barren, 15);
          expect(forecast1.description).to.equal(`Sunday - ${weatherDescriptions[Climate.Cold][Humidity.Barren][15]} (${forecast1.temperature})`);
          
          const forecast2 = new Forecast(timestamp, Climate.Hot, Humidity.Modest, 12);
          expect(forecast2.description).to.equal(`Sunday - ${weatherDescriptions[Climate.Hot][Humidity.Modest][12]} (${forecast2.temperature})`);
        });
      });

      describe('get temperature', () => {
        it('should handle Fahrenheit', async () => {
          await ModuleSettings.set(ModuleSettingKeys.useCelsius, false);

          const forecast1 = new Forecast(timestamp, Climate.Cold, Humidity.Barren, 15);
          expect(forecast1.temperature).to.equal(weatherTemperatures[Climate.Cold][Humidity.Barren][15] + '°F');
                   
          const forecast2 = new Forecast(timestamp, Climate.Hot, Humidity.Modest, 12);
          expect(forecast2.temperature).to.equal(weatherTemperatures[Climate.Hot][Humidity.Modest][12] + '°F');
        });

        it('should handle Celsius', async () => {
          await ModuleSettings.set(ModuleSettingKeys.useCelsius, true);

          const forecast1 = new Forecast(timestamp, Climate.Cold, Humidity.Barren, 15);
          expect(forecast1.temperature).to.equal(Math.floor((weatherTemperatures[Climate.Cold][Humidity.Barren][15]-32)*5/9) + '°C');
                   
          const forecast2 = new Forecast(timestamp, Climate.Hot, Humidity.Modest, 12);
          expect(forecast2.temperature).to.equal(Math.floor((weatherTemperatures[Climate.Hot][Humidity.Modest][12]-32)*5/9)+ '°C');
        });
      });

      after(async () => {
        await restoreSettings();
      });
    }
  )
};
