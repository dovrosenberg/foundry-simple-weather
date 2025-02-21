import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings'
import { Forecast } from '@/weather/Forecast';
import { cleanDate } from '@/utils/calendar';
import { version } from '@module';

export const migrateData = async(): Promise<void> => {
  // we just look at the prior version to see what upgrades need to apply
  const priorVersion = ModuleSettings.get(ModuleSettingKeys.previousVersion);

  // this captures everything before 1.17.4
  if (priorVersion === '') {
    let updatedForecasts = {} as Record<string, Forecast>;

    // forecast timestamps need to be set to the sunset time
    const forecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
    for (const [timestamp, forecast] of Object.entries(forecasts)) {
      // get the date from the timestamp
      const date = SimpleCalendar.api.timestampToDate(Number(timestamp));
      
      if (date) {
        const cleanedTimestamp = cleanDate(date);
        updatedForecasts[cleanedTimestamp.toString()] = new Forecast(cleanedTimestamp, forecast.climate, forecast.humidity, forecast.hexFlowerCell); 
      }
    }

    await ModuleSettings.set(ModuleSettingKeys.forecasts, updatedForecasts);
  }

  await ModuleSettings.set(ModuleSettingKeys.previousVersion, version);
}