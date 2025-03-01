// -------------------------------- //
// Quench Unit Testing              //
// -------------------------------- //

import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { log } from '@/utils/log';
import { registerUtilTests } from '@test/utils';
import { registerWeatherTests } from '@test/weather';

// Registers all `Quench` tests
Hooks.on("quenchReady", () => {
  registerUtilTests();
  registerWeatherTests();
});

const settings = {};

export const backupSettings = () => {
  for (const k of Object.values(ModuleSettingKeys)) {
    settings[k] = ModuleSettings.get(k as ModuleSettingKeys);
  }
}

export const restoreSettings = async () => {
  for (const k of Object.values(ModuleSettingKeys)) {
    await ModuleSettings.set(k as ModuleSettingKeys, settings[k]);
  }
}