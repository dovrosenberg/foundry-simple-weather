import { farenheitToCelsius } from './temperatureUtils';

describe('Temperature Utils', () => {
  it('SHOULD convert Farenheit to Celsius', () => {
    const farenheit = 41;
    const expectedCelsius = 5;

    expect(farenheitToCelsius(farenheit)).toBe(expectedCelsius);
  });
});
