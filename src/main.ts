import '@/../styles/simple-weather.scss';
import '@/../styles/menu-icon.scss';

import { moduleSettings, ModuleSettings, SettingKeys, updateModuleSettings } from '@/settings/ModuleSettings';
import { VersionUtils } from '@/utils/versionUtils';
import { getGame, isClientGM } from '@/utils/game';
import { log } from './utils/log';
import { allowSeasonSync, Climate, Humidity, initializeLocalizedText as initializeLocalizedClimateText } from '@/weather/climateData';
import { initializeLocalizedText as initializeLocalizedWeatherText } from '@/weather/weatherMap';
import { updateWeatherApplication, weatherApplication, WeatherApplication } from '@/applications/WeatherApplication';
import { updateWeatherEffects, WeatherEffects } from '@/weather/WeatherEffects';
import { KeyBindings } from '@/settings/KeyBindings';
import moduleJson from '@module';

// track which modules we have
let validSimpleCalendar = false;

/**
* Register module in Developer Mode module (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)
* No need to spam the console more than it already is, we hide them between a flag.
*/

// note: for the logs to actually work, you have to activate it in the UI under the config for the developer mode module
Hooks.once('devModeReady', async ({ registerPackageDebugFlag: registerPackageDebugFlag }: DevModeApi) => {
  registerPackageDebugFlag('simple-weather', 'boolean');
  //CONFIG.debug.hooks = true;
});

Hooks.once('init', async () => {
  // initialize settings first, so other things can use them
  updateModuleSettings(new ModuleSettings());
  updateWeatherEffects(new WeatherEffects());  // has to go first so we can activate any existing FX
  updateWeatherApplication(new WeatherApplication());

  // register keybindings
  KeyBindings.register();

  // expose the api
  const module = getGame().modules.get(moduleJson.id);
  if (module) {
    module.api = {
      runWeather: function(climate: Climate, humidity: Humidity, hexFlowerCell: number): void { 
        weatherApplication.setSpecificWeather(climate, humidity, hexFlowerCell); 
      },

      debugOutput: function(): void {
        weatherApplication.debugOutput();
      }
    }
  }
});

Hooks.once('ready', async () => {
  checkDependencies();

  // if we don't have simple calendar installed, we're ready to go 
  //    (otherwise wait for it to call the renderMainApp hook)
  if (!validSimpleCalendar) {
    weatherApplication.ready();
  }  
});

Hooks.once('i18nInit', async () => {
  initializeLocalizedClimateText();
  initializeLocalizedWeatherText();

  // rerender weather
  if (weatherApplication)
    weatherApplication.render();
});

// on non-GMs, we need to update whenever the GM changes the weather
Hooks.on('updateSetting', async (setting: Setting) => {
  if (!isClientGM() && setting.key === 'simple-weather.' + SettingKeys.lastWeatherData) 
    weatherApplication.setWeather();
});

// add the button to re-open the app
Hooks.on('getSceneControlButtons', async (controls: SceneControl[]) => {
  if (isClientGM() || moduleSettings.get(SettingKeys.dialogDisplay)) {
    // find the journal notes 
    const noteControls = controls.find((c) => {
        return c.name === "notes";
    });

    // add our own button
    if (noteControls && Object.prototype.hasOwnProperty.call(noteControls, "tools")) {
      noteControls.tools.push({
          name: "simple-weather",
          title: "sweath.labels.openButton",
          icon: "fas swr-icon",
          button: true,
          onClick: () => { weatherApplication.showWindow(); }
      });
    }
}
})

// called after simple calendar is fully loaded
Hooks.once('renderMainApp', async () => {
  log(false, 'simple-calendar-ready');

  // it's possible this gets called but the version # is too low - just ignore in that case
  if (validSimpleCalendar) {
    // set the date and time
    if (moduleSettings.get(SettingKeys.dialogDisplay) || isClientGM()) {
      // tell the application we're using the calendar
      weatherApplication.activateCalendar();

      weatherApplication.updateDateTime(SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp()));   // this is really for the very 1st load; after that this date should match what was saved in settings
    }

    // modify the drop-downs
    allowSeasonSync();

    // check the setting to see if we should be in sync mode (because if we did initial render before getting here, 
    //    it will have cleared it)
    weatherApplication.ready();

    // add the datetime change hook - we don't use SimpleCalendar.Hooks.DateTimeChange 
    //    because it doesn't call the hook on player clients
    Hooks.on('updateWorldTime', (timestamp) => {
      weatherApplication.updateDateTime(SimpleCalendar.api.timestampToDate(timestamp));
    });
  } else {
    weatherApplication.ready();
  }
});

// make sure we have a compatible version of simple-calendar installed
function checkDependencies() {
  const minimumVersion = '2.4.0';

  const module = getGame().modules.get('foundryvtt-simple-calendar');

  if (!module || !module.active) return;

  const scVersion = getGame().modules.get('foundryvtt-simple-calendar')?.version;

  if (scVersion && (scVersion===minimumVersion || VersionUtils.isMoreRecent(scVersion, minimumVersion))) {
    validSimpleCalendar = true; 
  } else if (scVersion) {
    ui.notifications?.error('Simple Calendar found, but version prior to v2.4.0. Make sure the latest version of Simple Calendar is installed.');
    ui.notifications?.error('Version found: ' + scVersion);
  }
}

