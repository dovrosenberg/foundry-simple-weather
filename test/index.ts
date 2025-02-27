// -------------------------------- //
// Quench Unit Testing              //
// -------------------------------- //

import { registerUtilTests } from '@test/utils';

// Registers all `Quench` tests
Hooks.on("quenchReady", () => {
  registerUtilTests();
});