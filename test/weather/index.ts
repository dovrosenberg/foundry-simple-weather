import { registerClimateDataTests } from './climateData.test';
import { registerEffectsMapTests } from './effectsMap.test';

export const registerWeatherTests = () => {
  registerClimateDataTests();
  registerEffectsMapTests();
}