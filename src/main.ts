import '@/../styles/notices.scss';
import '@/../styles/simple-weather.scss';

import { Notices } from '@/notices/notices';
import { ChatProxy } from '@/proxies/chatProxy';
import { ModuleSettings } from '@/settings/module-settings';
import { VersionUtils } from '@/utils/versionUtils';
import { Weather } from '@/weather';
import { getGame } from '@/utils/game';
import { log } from './utils/log';

const chatProxy = new ChatProxy();
let weather: Weather;

/**
* Register module in Developer Mode module (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)
* No need to spam the console more than it already is, we hide them between a flag.
*/

// note: for the logs to actually work, you have to activate it in the UI under the config for the developer mode module
Hooks.once('devModeReady', ({ registerPackageDebugFlag: registerPackageDebugFlag }: DevModeApi) => {
  registerPackageDebugFlag('simple-weather', 'boolean', { default: true });
});

Hooks.once('ready', () => {
  checkDependencies();
  log(false, 'ready');
});

Hooks.once('simple-calendar-ready', () => {
  //initializeModule();
  log(false, 'simple-calendar-ready');
});

// function initializeModule() {
//   const moduleSettings = new ModuleSettings();
//   initializeNotices(moduleSettings);

//   weather = new Weather(chatProxy, moduleSettings);

//   Hooks.on(SimpleCalendar.Hooks.DateTimeChange, ({date}: { date: SimpleCalendar.DateData }) => {
//     weather.onDateTimeChange(date);
//   });

//   weather.onReady();
// }

// function initializeNotices(settings: ModuleSettings) {
//   if (getGame().user?.isGM) {
//     const notices = new Notices(settings);
//     notices.checkForNotices();
//   }
// }

function checkDependencies() {
  if (!isSimpleCalendarCompatible()) {
    const errorMessage = 'Simple Weather cannot initialize and requires Simple Calendar v2.4.0. Make sure the latest version of Simple Calendar is installed.';
    ui.notifications?.error(errorMessage);
  }
}

function isSimpleCalendarCompatible(): boolean {
  const minimumVersion = '2.4.0';
  const scVersion = getGame().modules.get('foundryvtt-simple-calendar')?.version;
  return VersionUtils.isMoreRecent(scVersion, minimumVersion) || scVersion === minimumVersion;
}
