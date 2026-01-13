import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings'
import { Forecast } from '@/weather/Forecast';
import { cleanDate } from '@/utils/calendar';
import { version } from '@module';
import { WeatherData } from '@/weather/WeatherData';
import { getCalendarAdapter } from '@/calendar';

const migrateData = async(): Promise<void> => {
  // we just look at the prior version to see what upgrades need to apply
  const priorVersion = ModuleSettings.get(ModuleSettingKeys.previousVersion);

  // this captures everything before 1.17.4
  if (priorVersion === '') {
    if (!('SimpleCalendar' in globalThis)) {
      const errorMessage = 'You cannot currently migrate Simple Weather from a version prior to 1.17.4 without having Simple Calendar installed.  It is highly recommended \
        that you turn off Simple Weather until you have Simple Calendar installed and then re-enable it after installing Simple Calendar.  Once migrated, you can then \
        remove Simple Calendar again, if desired.';
      
        ui.notifications.error(errorMessage);
        throw new Error(errorMessage);
    }

    let updatedForecasts = {} as Record<string, Forecast>;

    // forecast timestamps need to be set to the sunset time
    const forecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
    const calendarAdapter = getCalendarAdapter();
    
    if (!calendarAdapter) {
      throw new Error('No calendar adapter available during migration');
    }
    
    for (const [timestamp, forecast] of Object.entries(forecasts)) {
      // get the date from the timestamp
      const date = calendarAdapter.timestampToDate(Number(timestamp));
      
      if (date) {
        const cleanedTimestamp = cleanDate(date);
        // validate or skip
        if (cleanedTimestamp !== null && forecast && WeatherData.validateWeatherParameters(forecast.climate, forecast.humidity, forecast.hexFlowerCell))
          updatedForecasts[cleanedTimestamp.toString()] = new Forecast(cleanedTimestamp, forecast.climate, forecast.humidity, forecast.hexFlowerCell); 
      }
    }

    // TODO - delete any of the keys that are no longer present
    await ModuleSettings.set(ModuleSettingKeys.forecasts, updatedForecasts);
  }

  await ModuleSettings.set(ModuleSettingKeys.previousVersion, version);
}

export {
  migrateData,
}
