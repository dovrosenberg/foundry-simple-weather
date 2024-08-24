import '@/../styles/simple-weather.scss';
import '@/../styles/menu-icon.scss';

import { moduleSettings, ModuleSettings, ModuleSettingKeys, updateModuleSettings } from '@/settings/ModuleSettings';
import { VersionUtils } from '@/utils/versionUtils';
import { getGame, isClientGM } from '@/utils/game';
import { allowSeasonSync, Climate, Humidity, initializeLocalizedText as initializeLocalizedClimateText } from '@/weather/climateData';
import { initializeLocalizedText as initializeLocalizedWeatherText } from '@/weather/weatherMap';
import { updateWeatherApplication, weatherApplication, WeatherApplication } from '@/applications/WeatherApplication';
import { updateWeatherEffects, weatherEffects, WeatherEffects } from '@/weather/WeatherEffects';
import { KeyBindings } from '@/settings/KeyBindings';
import moduleJson from '@module';
import { SceneSettingKeys, sceneSettings, SceneSettings, updateSceneSettings } from './settings/SceneSettings';

// track which modules we have
let simpleCalendarInstalled = false;

// look for #swr-fsc-compact-open; what is the class on the parent div that wraps it?
const SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER = 'fsc-pj';  // no dot in the front
const SC_MINIMUM_VERSION = '2.4.0';
const SC_PREFERRED_VERSION = '2.4.18';

// also see instructions in WeatherApplication.ts for adjusting constants


// how do we decide what mode we're in and whether its visible or not?
// 1. look to the attachment setting - this controls whether we're in attached mode or not; 
//      if it's turned on but simple calendar can't be found, you're out of luck...
//     a. we assume it's not compact mode until we see otherwise (by presence of div.SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER)
// 2. if we're not in attached mode, we:
//     a.  load the settings from last time to determine the location and visibility
//     b.  add the button to the journal notes to turn it on
// 3. if we are in attached mode, always starts hidden; we then wait for the calendar window
//      to be registered and we attach the button to it

/**
* Register module in Developer Mode module (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)
* No need to spam the console more than it already is, we hide them with  a flag.
*/

// note: for the logs to actually work, you have to activate it in the UI under the config for the developer mode module
Hooks.once('devModeReady', async ({ registerPackageDebugFlag: registerPackageDebugFlag }: DevModeApi) => {
  registerPackageDebugFlag('simple-weather', 'boolean');
  CONFIG.debug.hooks = true;
});

Hooks.once('init', async () => {
  // initialize settings first, so other things can use them
  updateModuleSettings(new ModuleSettings());
  updateSceneSettings(new SceneSettings());
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
  if (!simpleCalendarInstalled) {
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
  if (!isClientGM() && setting.key === 'simple-weather.' + ModuleSettingKeys.lastWeatherData) 
    weatherApplication.setWeather();
});

// handle scene changes
Hooks.on('getSceneControlButtons', (controls: SceneControl[]) => {
  // update the weather effects for the scene setting if needed
  note that FXMaster settings are global!  So we need to manually turn stuff on/off
  if (moduleSettings.get(ModuleSettingKeys.FXByScene)) {
    weatherEffects.fxActive = sceneSettings.get(SceneSettingKeys.fxActive);
  }

  // if in attach mode, don't need to add the button
  if (weatherApplication.attachedMode)
    return;

  // otherwise, add the button to re-open the app 
  if (isClientGM() || moduleSettings.get(ModuleSettingKeys.dialogDisplay)) {
    // find the journal notes 
    const noteControls = controls.find((c) => {
        return c.name === "notes";
    });

    // add our own button
    if (noteControls && noteControls.tools) {
      noteControls.tools.push({ 
          name: "simple-weather",
          title: "sweath.labels.openButton",
          icon: "fas swr-icon",
          button: true,
          onClick: () => {   
            if (weatherApplication)
              weatherApplication.showWindow(); 
          }
      });
    }
}
})

// make sure we have a compatible version of simple-calendar installed
function checkDependencies() {
  const module = getGame().modules.get('foundryvtt-simple-calendar');

  const scVersion = module?.version;

  // if not present, just display a warning if we're in attached mode
  if (!module || !module?.active || !scVersion) {
    if (moduleSettings.get(ModuleSettingKeys.attachToCalendar)) {
      if (isClientGM()) {
        ui.notifications?.warn(`Simple Weather is set to "Attached Mode" in settings but Simple Calendar is not installed.  This will keep it from displaying at all.  You should turn off that setting if this isn't intended.`);
      }
    }

    simpleCalendarInstalled = false; 
    return;
  }

  const meetsMinimumVersion = (scVersion===SC_MINIMUM_VERSION || VersionUtils.isMoreRecent(scVersion, SC_MINIMUM_VERSION));

  if (!meetsMinimumVersion) {
    simpleCalendarInstalled = false; 

    if (isClientGM()) {
      ui.notifications?.error(`Simple Calendar found, but version prior to v${SC_MINIMUM_VERSION}. Make sure the latest version of Simple Calendar is installed.`);
      ui.notifications?.error('Version found: ' + scVersion);
    }
  } else if (scVersion && (scVersion!==SC_PREFERRED_VERSION)) {
    simpleCalendarInstalled = true; 

    if (isClientGM()) {
      ui.notifications?.error(`This version of Simple Weather only fully supports Simple Calendar v${SC_PREFERRED_VERSION}. "Attached mode" is unlikely to work properly.`);
      ui.notifications?.error('Version found: ' + scVersion);
    }
  } else {
    simpleCalendarInstalled = true; 
  }
}

Hooks.once(SimpleCalendar.Hooks.Init, async () => {
  // it's possible this gets called but the version # is too low - just ignore in that case
  if (simpleCalendarInstalled) {
    weatherApplication.simpleCalendarInstalled();
    
    // set the date and time
    if (moduleSettings.get(ModuleSettingKeys.dialogDisplay) || isClientGM()) {
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
  
  // check the setting to see if we want to dock
  if (weatherApplication.attachedMode) {
    // can set this either way, but it does nothing when not in compact mode (but we only need to set it once)
    SimpleCalendar.api.addSidebarButton("Simple Weather", "fa-cloud-sun", "", false, () => weatherApplication.toggleAttachModeHidden());

    // we also need to watch for when the calendar is rendered because in compact mode we
    //    have to inject the button 
    Hooks.on('renderMainApp', (_application: Application, html: JQuery<HTMLElement>) => {
      // if SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER div exists then it's in compact mode
      // in compact mode, there's no api to add a button, so we monkeypatch one in
      const compactMode = html.find(`.${SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER}`).length>0;
      if (compactMode) {
        weatherApplication.setCompactMode(true);

        // if it's already there, no need to do anything (it doesn't change)
        if (html.find('#swr-fsc-compact-open').length === 0) {
          const newButton = `
          <div id="swr-fsc-compact-open" style="margin-left: 8px; cursor: pointer; ">
            <div data-tooltip="Simple Weather" style="color:var(--comapct-header-control-grey);">    
              <span class="fa-solid fa-cloud-sun"></span>
            </div>
          </div>
          `;

          // add the button   
          // note: how to find the new class when new SC release comes out?
          //   it's the div that wraps the small buttons in the top left in compact mode
          html.find(`.${SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER}`).append(newButton);

          html.find('#swr-fsc-compact-open').on('click',() => {
            weatherApplication.toggleAttachModeHidden();
          });
        }
      } else {
        weatherApplication.setCompactMode(false);
      }  
    });
  }
});

