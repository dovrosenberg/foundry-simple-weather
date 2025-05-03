import { registerClimateDataTests } from './climateData.test';
import { registerEffectsMapTests } from './effectsMap.test';
import { registerForecastTests } from './Forecast.test';
import { registerGenerateWeatherTests } from './GenerateWeather.test';

export const registerWeatherTests = () => {
  registerClimateDataTests();
  registerEffectsMapTests();
  registerForecastTests();
  registerGenerateWeatherTests();
};
