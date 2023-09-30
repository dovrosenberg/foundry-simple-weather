import { farenheitToCelcius } from './temperatureUtils';

describe('Temperature Utils', () => {
  it('SHOULD convert Farenheit to Celcius', () => {
    const farenheit = 41;
    const expectedCelcius = 5;

    expect(farenheitToCelcius(farenheit)).toBe(expectedCelcius);
  });
});
