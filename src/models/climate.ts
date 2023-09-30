import { Climates } from './weatherData';

export class Climate {
  isVolcanic: boolean;
  name: Climates;
  humidity: number;
  baseTemperature: number;
  temperatureRange: { min: number, max: number };
}
