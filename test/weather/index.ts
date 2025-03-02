import { registerClimateDataTests } from './climateData.test';
import { registerEffectsMapTests } from './effectsMap.test';
import { registerForecastTests } from './Forecast.test';
import { registerWeatherGenerationTests } from './weatherGeneration.test';

export const registerWeatherTests = () => {
  registerClimateDataTests();
  registerEffectsMapTests();
  registerForecastTests();
  registerWeatherGenerationTests();
};
