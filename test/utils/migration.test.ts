import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { migrateData } from '@/utils/migration';
import { Climate, Humidity } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';
import { QuenchBatchContext } from '@ethaks/fvtt-quench'
import { version } from '@module';
import { runTestsForEachCalendar } from '@test/calendarTestHelper';
import { calendarManager } from '@/calendar/CalendarManager';

export const registerMigrationTests = () => {
  runTestsForEachCalendar(
    'simple-weather.utils.migration',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before } = context;

      let previousVersion: string;
      let forecasts: Record<string, Forecast>;
      
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

        it('should adjust forecast timestamps to 0:00 (midnight)', async () => {
          await ModuleSettings.set(ModuleSettingKeys.previousVersion, '');

          // create a date using the current adapter
          const adapter = calendarManager.getAdapter();
          if (!adapter) throw new Error('No calendar adapter available');
          
          const date = adapter.timestampToDate(2342342342);
          if (!date) throw new Error('Could not create date from timestamp');
          
          // Calculate midday timestamp (12:00) for the test
          const middayTimestamp = adapter.dateToTimestamp({
            ...date,
            hour: 12,
            minute: 0
          });
          
          const badForecasts = {
            [middayTimestamp.toString()]: new Forecast(middayTimestamp, Climate.Cold, Humidity.Barren, 24),
          }
          await ModuleSettings.set(ModuleSettingKeys.forecasts, badForecasts);

          await migrateData();

          const updatedForecast = ModuleSettings.get(ModuleSettingKeys.forecasts);
          expect(Object.keys(updatedForecast).length).to.equal(1);
          // The timestamp should be cleaned to 0:00 (midnight)
          const cleanedDate = adapter.timestampToDate(Number(Object.keys(updatedForecast)[0]));
          expect(cleanedDate).to.not.be.null;
          expect(cleanedDate!.hour).to.equal(0);
          expect(cleanedDate!.minute).to.equal(0);
        });
      });

      after(async () => {
        await ModuleSettings.set(ModuleSettingKeys.previousVersion, previousVersion);
        await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);
      });
    }
  )
};



