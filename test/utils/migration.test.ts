import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { migrateData } from '@/utils/migration';
import { Climate, Humidity } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';
import { QuenchBatchContext } from '@ethaks/fvtt-quench'
import { version } from '@module';

export const registerMigrationTests = () => {
  quench.registerBatch(
    'simple-weather.utils.migration',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before } = context;

      let previousVersion: string;
      let forecasts: Record<string, Forecast>;
      let currentDate: SimpleCalendar.DateTime;
      
      // save the current settings so we can mess with them
      before(() => {
        previousVersion = ModuleSettings.get(ModuleSettingKeys.previousVersion);
        forecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
      });

      describe('migrateData', () => {
        it('should set previousVersion if unset', async () => {
          await ModuleSettings.set(ModuleSettingKeys.previousVersion, '');

          await migrateData();

          expect(ModuleSettings.get(ModuleSettingKeys.previousVersion)).to.equal(version);
        });

        it('should adjust forecast timestamps to the sunset time', async () => {
          await ModuleSettings.set(ModuleSettingKeys.previousVersion, '');

          // create a date
          const date = SimpleCalendar.api.timestampToDate(2342342342) as SimpleCalendar.DateData;
          const badForecasts = {
            [date.midday.toString()]: new Forecast(date.midday, Climate.Cold, Humidity.Barren, 24),
          }
          await ModuleSettings.set(ModuleSettingKeys.forecasts, badForecasts);

          await migrateData();

          const updatedForecast = ModuleSettings.get(ModuleSettingKeys.forecasts);
          expect(Object.keys(updatedForecast).length).to.equal(1);
          expect(updatedForecast[date.sunset.toString()].timestamp).to.equal(date.sunset);
        });
      });

      after(async () => {
        await ModuleSettings.set(ModuleSettingKeys.previousVersion, previousVersion);
        await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);
      });
    }
  )
};



