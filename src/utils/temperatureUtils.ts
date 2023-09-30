
export function farenheitToCelcius(farenheit: number) {
  return Number(((farenheit - 32) * 5 / 9).toFixed(1));
}
