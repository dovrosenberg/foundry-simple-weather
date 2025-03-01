// -------------------------------- //
// Quench Unit Testing              //
// -------------------------------- //

import { registerUtilTests } from '@test/utils';
import { registerWeatherTests } from '@test/weather';

// Registers all `Quench` tests
Hooks.on("quenchReady", () => {
  registerUtilTests();
  registerWeatherTests();
});