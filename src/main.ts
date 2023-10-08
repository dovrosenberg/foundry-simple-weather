import '@/../styles/simple-weather.scss';

import { ModuleSettings } from '@/settings/module-settings';
import { VersionUtils } from '@/utils/versionUtils';
import { getGame } from '@/utils/game';
import { log } from './utils/log';
import { SimpleWeather } from './SimpleWeather';

let moduleSettings: ModuleSettings;
let simpleWeather: SimpleWeather;

/**
* Register module in Developer Mode module (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)
* No need to spam the console more than it already is, we hide them between a flag.
*/

// note: for the logs to actually work, you have to activate it in the UI under the config for the developer mode module
Hooks.once('devModeReady', ({ registerPackageDebugFlag: registerPackageDebugFlag }: DevModeApi) => {
  registerPackageDebugFlag('simple-weather', 'boolean');
});

Hooks.once('ready', () => {
  checkDependencies();

  moduleSettings = new ModuleSettings();
  simpleWeather = new SimpleWeather(moduleSettings);

  log(false, 'ready');
});

Hooks.once(SimpleCalendar.Hooks.Ready, () => {
  log(false, 'simple-calendar-ready');

  Hooks.on(SimpleCalendar.Hooks.DateTimeChange, ({newDate}: { newDate: SimpleCalendar.DateData }) => {
    simpleWeather.onCalendarDateTimeChange(newDate);
  });

  simpleWeather.onCalendarReady();
});

// make sure we have a compatible version of simple-calendar installed
function checkDependencies() {
  const minimumVersion = '2.4.0';
  const scVersion = getGame().modules.get('foundryvtt-simple-calendar')?.version;

  if (scVersion && (scVersion===minimumVersion || VersionUtils.isMoreRecent(scVersion, minimumVersion)))
    return;

  ui.notifications?.error('Simple Weather cannot initialize and requires Simple Calendar v2.4.0. Make sure the latest version of Simple Calendar is installed.');
  ui.notifications?.error('Version found: ' + scVersion);
}

