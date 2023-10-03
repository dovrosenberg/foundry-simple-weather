import '../styles/notices.scss';
import '../styles/simple-weather.scss';

import { DevMode } from './libraries/devMode/devMode';
import { DevModeApi } from './libraries/devMode/devModeApi';
import { Log } from './logger/logger';
import { Notices } from './notices/notices';
import { ChatProxy } from './proxies/chatProxy';
import { ModuleSettings } from './settings/module-settings';
import { VersionUtils } from './utils/versionUtils';
import { Weather } from './weather';

const logger = new Log();
const chatProxy = new ChatProxy();
let weather: Weather;

function getGame(): Game {
  if(!(game instanceof Game)) {
    throw new Error('Game is not initialized yet!');
  }
  return game;
}

/**
* Register module in Developer Mode module (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)
* No need to spam the console more than it already is, we hide them between a flag.
*/
Hooks.once('devModeReady', ({ registerPackageDebugFlag: registerPackageDebugFlag }: DevModeApi) => {
  registerPackageDebugFlag('simple-weather', 'level');
  const devModeModule: DevMode = getGame().modules.get('_dev-mode') as unknown as DevMode;

  try {
    logger.registerLevelCheckCallback(() => devModeModule?.api?.getPackageDebugValue('simple-weather', 'level'));
  // eslint-disable-next-line no-empty
  } catch (e) {}
});

Hooks.once('ready', () => {
  checkDependencies();
});

Hooks.once('simple-calendar-ready', () => {
  initializeModule();
});

function initializeModule() {
  const moduleSettings = new ModuleSettings(getGame());
  initializeNotices(moduleSettings);

  weather = new Weather(getGame(), chatProxy, logger, moduleSettings);

  Hooks.on(SimpleCalendarHooks.DateTimeChange, ({date}: { date: SimpleCalendar.DateData }) => {
    weather.onDateTimeChange(date);
  });

  weather.onReady();
}

function initializeNotices(settings: ModuleSettings) {
  if (getGame().user?.isGM) {
    const notices = new Notices(getGame(), settings);
    notices.checkForNotices();
  }
}

function checkDependencies() {
  if (!isSimpleCalendarCompatible()) {
    const errorMessage = 'Simple Weather cannot initialize and requires Simple Calendar v2.4.0. Make sure the latest version of Simple Calendar is installed.';
    ui.notifications.error(errorMessage);
  }
}

function isSimpleCalendarCompatible(): boolean {
  const minimumVersion = '2.4.0';
  const scVersion = getGame().modules.get('foundryvtt-simple-calendar').version;
  return VersionUtils.isMoreRecent(scVersion, minimumVersion) || scVersion === minimumVersion;
}
