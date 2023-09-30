import { Climate } from './climate';
import { CurrentDate } from './currentDate';
import { WeatherData } from './weatherData';

describe('WeahterData', () => {
  it('SHOULD create with provided properties', () => {
    const properties: Partial<WeatherData> = {
      climate: new Climate(),
      currentDate: new CurrentDate(),
      isVolcanic: false,
      lastTemp: 0,
      precipitation: 'precip',
      temp: 1,
      tempRange: { min: 2, max: 3 }
    };

    const weatherData = new WeatherData(properties);

    expect(weatherData).toEqual(expect.objectContaining(properties));
  });
});
