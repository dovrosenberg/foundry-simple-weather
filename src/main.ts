import '@/../styles/simple-weather.scss';
import '@/../styles/menu-icon.scss';

import { ModuleSettings, ModuleSettingKeys, } from '@/settings/ModuleSettings';
import { isClientGM, localize } from '@/utils/game';
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
import { calendarManager, CalendarType } from '@/calendar';
export { calendarManager, CalendarType };
import { getCalendarAdapter } from '@/calendar';


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
  if (import.meta.env.MODE === 'development') {
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

  // if we don't have any calendar installed, we're ready to go 
  //    (otherwise wait for it to call the renderMainApp hook)
  if (!calendarManager.hasActiveCalendar) {
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
    await weatherApplication.setWeather();
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
        title: 'swr.labels.openButton',  // localized by Foundry
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
  if (!isClientGM() || !ModuleSettings.get(ModuleSettingKeys.FXByScene))
    return;

  // v14 renders by parts and this hook can fire repeatedly; don't inject twice
  if (html.querySelector('#swr-scene-fx-active'))
    return;

  // use the scene being edited, not the current one
  const scene = app.document as Scene;

  // read the flag directly; SceneSettings.get() would write the default, which re-renders this sheet mid-render
  const currentSceneFX = (scene.getFlag(moduleJson.id, SceneSettingKeys.fxActive) as boolean | undefined) ?? true;

  // no name attribute on the checkbox: the change handler is the only writer of the flag, so the
  //    sheet's form submit can't save a second (possibly stale) copy
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
      <label for="swr-scene-fx-active">${localize('sceneConfig.fxActive')}</label>
      <input
        type="checkbox"
        id="swr-scene-fx-active"
        ${currentSceneFX ? 'checked' : ''}>
      <p class="hint notes">${localize('sceneConfig.fxActiveHelp')}</p>
    </div>
  </fieldset>`;

  // anchor on the weather <select> directly (Basics tab)
  const anchor = html.querySelector('[name="weather"]')?.closest('.form-group');
  if (!anchor) {
    console.warn('simple-weather | Could not find weather field in SceneConfig; skipping injection');
    return;
  }
  anchor.insertAdjacentHTML('afterend', injection);

  const checkbox = html.querySelector('#swr-scene-fx-active') as HTMLInputElement | null;
  checkbox?.addEventListener('change', async () => {
    if (scene.id === SceneSettings.currentScene?.id) {
      // editing the scene we're on: toggle live FX (this also saves the flag)
      await weatherEffects.setFxActive(checkbox.checked);
    } else {
      // editing some other scene: just save its flag
      await SceneSettings.set(SceneSettingKeys.fxActive, checkbox.checked, scene);
    }
    weatherApplication?.render();
  });

  // fix box height
  app.setPosition({ height: 'auto' });
})

// make sure we have a compatible version of a calendar module installed
function checkDependencies(): void {  
  // Show version-specific warnings if needed
  const calendarInfo = calendarManager.currentCalendar;
  if (calendarInfo.isActive && !calendarInfo.meetsMinimumVersion) {
    if (isClientGM()) {
      const module = game.modules.get(calendarInfo.type);
      ui.notifications?.error(`${calendarInfo.type} found, but version prior to minimum required. Make sure the latest version is installed.`);
      ui.notifications?.error('Version found: ' + calendarInfo.version);
    }
  }
}

// Register calendar integration in setup hook instead of parse-time
// Using 'setup' ensures all init hooks have completed, so the bridge's fake module
// registration and parse-time global exposure will be available regardless of load order.
Hooks.once('setup', (): void => {
  // Use the calendar manager to detect and set the active calendar
  calendarManager.detectAndSetCalendar();

  const calendarAdapter = getCalendarAdapter();
  
  if (!calendarAdapter)
    return;
  
  const hooks = calendarAdapter.hooks;
  if (hooks.init) {
    Hooks.once(hooks.init, async (): Promise<void> => {
      // it's possible this gets called but the version # is too low - just ignore in that case
      if (calendarManager.hasActiveCalendar) {
        // set the date and time
        if (ModuleSettings.get(ModuleSettingKeys.dialogDisplay) || isClientGM()) {
          // tell the application we're using the calendar
          weatherApplication.activateCalendar();

          weatherApplication.updateDateTime(calendarAdapter.timestampToDate(calendarAdapter.getCurrentTimestamp()), true);   // this is really for the very 1st load; after that this date should match what was saved in settings
        }

        // modify the drop-downs
        allowSeasonSync();

        // create the sound playlist
        await initSounds();

        weatherApplication.ready();

        // Listen for date/time changes from the calendar (note that Simple Calendar's date change
        //    hook doesn't fire on player clients, but Foundry's does)
        Hooks.on('updateWorldTime', (timestamp: number) => {
          weatherApplication.updateDateTime(calendarAdapter.timestampToDate(timestamp));
        });
      }
    });
  }

  // check the setting to see if we want to dock
  if (weatherApplication.attachedMode) {
    if (isClientGM() || ModuleSettings.get(ModuleSettingKeys.dialogDisplay)) {
      getCalendarAdapter()?.addSidebarButton(weatherApplication, () => weatherApplication.toggleAttachModeHidden());
    }
  }
});

