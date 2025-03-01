import { registerClimateDataTests } from './climateData.test';
import { registerEffectsMapTests } from './effectsMap.test';
import { registerForecastTests } from './Forecast.test';
import { registerForecastGenerationTests } from './forecastGeneration.test';

export const registerWeatherTests = () => {
  registerClimateDataTests();
  registerEffectsMapTests();
  registerForecastTests();
  registerForecastGenerationTests();
};
