import '@/../styles/simple-weather.scss';
import '@/../styles/menu-icon.scss';

import { ModuleSettings, ModuleSettingKeys, } from '@/settings/ModuleSettings';
import { VersionUtils } from '@/utils/versionUtils';
import { isClientGM } from '@/utils/game';
import { allowSeasonSync, Climate, HexFlowerCell, Humidity, initializeLocalizedText as initializeLocalizedClimateText } from '@/weather/climateData';
import { initializeLocalizedText as initializeLocalizedWeatherText } from '@/weather/weatherMap';
import { updateWeatherApplication, weatherApplication, WeatherApplication } from '@/applications/WeatherApplication';
import { updateWeatherEffects, weatherEffects, WeatherEffects } from '@/weather/WeatherEffects';
import { KeyBindings } from '@/settings/KeyBindings';
import moduleJson from '@module';
import { SceneSettingKeys, SceneSettings, } from '@/settings/SceneSettings';
import { initSounds } from '@/utils/playlist';
import { migrateData } from '@/utils/migration';
import { WeatherData } from './weather/WeatherData';

// track which modules we have
export let simpleCalendarInstalled = false;

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
  // Load Quench test in development environment
  if (import.meta.env.DEV) {
    await import('@test/index');
  }

// initialize settings first, so other things can use them
  ModuleSettings.registerSettings();

  updateWeatherEffects(new WeatherEffects());  // has to go first so we can activate any existing FX
  updateWeatherApplication(new WeatherApplication());

  // register keybindings
  KeyBindings.register();

  // expose the api
  const module = game.modules.get(moduleJson.id);
  if (module) {
    module.api = {
      runWeather: function(climate: Climate, humidity: Humidity, hexFlowerCell: HexFlowerCell): void { 
        // validate because input coming from outside
        if (!WeatherData.validateWeatherParameters(climate, humidity, hexFlowerCell))
          throw new Error('Invalid parameters in runWeather()');

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

  // do any data migration - not in init because isClientGM() won't be set
  await migrateData();

  // if we don't have simple calendar installed, we're ready to go 
  //    (otherwise wait for it to call the renderMainApp hook)
  if (!simpleCalendarInstalled) {
      // create the sound playlist
      await initSounds();

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
Hooks.on('canvasInit', async (canvas: Canvas) => {
  // update the weather effects for the scene setting if needed
  SceneSettings.currentScene = canvas.scene;

  await weatherApplication.setFXActive(SceneSettings.get(SceneSettingKeys.fxActive));
});

// handle scene changes
Hooks.on('getSceneControlButtons', async (controls: Record<string, SceneControl>) => {
  // if in attach mode, don't need to add the button
  if (weatherApplication.attachedMode)
    return;

  // otherwise, add the button to re-open the app 
  if (isClientGM() || ModuleSettings.get(ModuleSettingKeys.dialogDisplay)) {
    // find the journal notes 
    const noteControls = controls['notes'];

    // add our own button
    if (noteControls && noteControls.tools) {
      noteControls.tools['simple-weather'] = {
        name: 'simple-weather',
        title: 'swr.labels.openButton',
        icon: 'fas swr-icon',
        button: true,
        onChange: () => {   
          if (weatherApplication)
            weatherApplication.showWindow(); 
        }
      };
    }
  }
})

// add the setting to the scene config application
Hooks.on('renderSceneConfig', async (app: SceneConfig, html: HTMLElement) => {
  if (!isClientGM())
    return;

  if (!ModuleSettings.get(ModuleSettingKeys.FXByScene))
    return;
  
  // get the setting
  const currentSceneFX = SceneSettings.get(SceneSettingKeys.fxActive, app.object);

  const injection = `
  <style> .swr-scene-config {
      border: 1px solid #999;
      border-radius: 8px;
      margin: 8px 0;
      padding: 0 15px 5px 15px;
  }</style>
  <fieldset class="swr-scene-config">
    <legend><span>Simple Weather</span></legend>
    <div class="form-group">
      <label>FX on</label>
      <input
        type="checkbox"
        id="swr-scene-fx-active"
        name="flags.simple-weather.swr-fxActive"
        ${currentSceneFX ? 'checked' : ''}>
      <p class="notes">Should FX be used on this scene?</p>
    </div>
  </fieldset>`;
  
  const matchElementById = /<[^>]*id[\\s]?=[\\s]?['\"](SceneConfig-Scene-.*-weather)['\"]/gi;
  const weatherEffectBox = matchElementById.exec(html.outerHTML);
  if (!weatherEffectBox)
    throw new Error('Format of SceneConfig sheet invalid');

  const boxId = weatherEffectBox[1];
  const formGroup = html.querySelector('#' + boxId )?.closest('.form-group');

  if (!formGroup)
    throw new Error('Format of SceneConfig sheet invalid');

  // insert our html
  formGroup.insertAdjacentHTML('afterend', injection);

  // insert the click handler
  // we could have used 'name=flags.simple-weather.swr-fxActive' on the checkbox, but that only saves the value, it doesn't update
  // the value in the popup or actually handle turning the fx on/off
  const checkbox = html.querySelector('#swr-scene-fx-active') as HTMLInputElement;
  if (checkbox) {
    checkbox.addEventListener("change", async (event) => {
      await weatherEffects.setFxActive(checkbox.checked);
      weatherApplication.render();
    });
  }
  // fix box height
  app.setPosition({ height: 'auto' });
})

// make sure we have a compatible version of simple-calendar installed
function checkDependencies(): void {
  const module = game.modules.get('foundryvtt-simple-calendar');

  const scVersion = module?.version;

  // if not present, just display warnings/errors for incompatible options
  if (!module || !module?.active || !scVersion) {
    if (isClientGM()) {
      if (ModuleSettings.get(ModuleSettingKeys.attachToCalendar)) {
        ui.notifications?.warn(`Simple Weather is set to "Attached Mode" in settings but Simple Calendar is not installed.  This will keep it from displaying at all.  You should turn off that setting if this isn't intended.`);
      }
  
      if (ModuleSettings.get(ModuleSettingKeys.useForecasts)) {
        ui.notifications?.error('Simple Weather requires Simple Calendar to generate forecasts. Please install and enable Simple Calendar or disable forecasts in the settings.');
      }

      if (ModuleSettings.get(ModuleSettingKeys.outputDateToChat)) {
        ui.notifications?.error('Simple Weather cannot output dates to chat without Simple Calendar. Please install and enable Simple Calendar or disable "output date to chat" in the settings.');
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

Hooks.once(SimpleCalendar.Hooks.Init, async (): Promise<void> => {
  // it's possible this gets called but the version # is too low - just ignore in that case
  if (simpleCalendarInstalled) {
    weatherApplication.simpleCalendarInstalled();
    
    // set the date and time
    if (ModuleSettings.get(ModuleSettingKeys.dialogDisplay) || isClientGM()) {
      // tell the application we're using the calendar
      weatherApplication.activateCalendar();

      weatherApplication.updateDateTime(SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp()));   // this is really for the very 1st load; after that this date should match what was saved in settings
    }

    // modify the drop-downs
    allowSeasonSync();

    // create the sound playlist
    await initSounds();

      // check the setting to see if we should be in sync mode (because if we did initial render before getting here, 
    //    it will have cleared it)
    weatherApplication.ready();

    // add the datetime change hook - we don't use SimpleCalendar.Hooks.DateTimeChange 
    //    because it doesn't call the hook on player clients
    Hooks.on('updateWorldTime', (timestamp) => {
      weatherApplication.updateDateTime(SimpleCalendar.api.timestampToDate(timestamp));
    });
  }
  
  // check the setting to see if we want to dock
  if (weatherApplication.attachedMode) {
    if (isClientGM() || ModuleSettings.get(ModuleSettingKeys.dialogDisplay)) {
      // can set this either way, but it does nothing when not in compact mode (but we only need to set it once)
      SimpleCalendar.api.addSidebarButton("Simple Weather", "fa-cloud-sun", "", false, () => weatherApplication.toggleAttachModeHidden());
    }

    // we also need to watch for when the calendar is rendered because in compact mode we
    //    have to inject the button 
    Hooks.on('renderMainApp', (_application: Application, html: JQuery<HTMLElement>) => {
      // if SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER div exists then it's in compact mode
      // in compact mode, there's no api to add a button, so we monkey patch one in
      const compactMode = html.find(`.${SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER}`).length>0;
      if (compactMode) {
        weatherApplication.render();

        // if it's already there, no need to do anything (it doesn't change)
        if (html.find('#swr-fsc-compact-open').length === 0) {
          const newButton = `
          <div id="swr-fsc-compact-open" style="margin-left: 8px; cursor: pointer; ">
            <div data-tooltip="Simple Weather" style="color:var(--compact-header-control-grey);">    
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
        weatherApplication.render();
      }  
    });
  }
});

