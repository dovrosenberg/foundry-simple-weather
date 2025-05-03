// -------------------------------- //
// Quench Unit Testing              //
// -------------------------------- //

import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { registerUtilTests } from '@test/utils';
import { registerWeatherTests } from '@test/weather';

// Registers all `Quench` tests
Hooks.on("quenchReady", () => {
  registerUtilTests();
  registerWeatherTests();
});

const settings = {};

const backupSettings = () => {
  for (const k of Object.values(ModuleSettingKeys)) {
    settings[k] = ModuleSettings.get(k as ModuleSettingKeys);
  }
}

const restoreSettings = async () => {
  for (const k of Object.values(ModuleSettingKeys)) {
    await ModuleSettings.set(k as ModuleSettingKeys, settings[k]);
  }
}

export { 
  backupSettings,
  restoreSettings,
}