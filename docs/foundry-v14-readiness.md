# Foundry v14 Update: Step-by-Step To-Do List

_Written 2026-11-08 against Simple Weather v2.2.2. Target: Foundry **14.370** (latest v14 stable)._

Work through the steps in order. Each step lists:

- **Files**: what to open
- **Do**: the specific change, with a suggested snippet
- **Check**: how to confirm it worked

Steps 1–7 are needed before you mark v14 as verified. Steps 8–13 clear deprecation warnings: everything works in v14 without them, but they break in v15/v16. Steps 14–16 are tooling and release.

Snippets are suggestions to adapt, not drop-in patches. Wherever an API couldn't be verified against a live v14 install, the step says so.

---

## Part A: Set up and smoke test

### ☐ Step 1. Set up a v14 dev environment

**Files:** `package.json`

**Do:**

1. Add v14 versions of the data-folder scripts. `linkdata`, `unlinkdata`, `rmfolder` and `copy` all point at `~/foundry13data`. Either add `*14` copies or parameterize the path:
   ```json
   "linkdata14": "ln -s $PWD/dist ~/foundry14data/Data/modules/simple-weather",
   "unlinkdata14": "unlink ~/foundry14data/Data/modules/simple-weather",
   ```
2. In the v14 data folder, install the v14 releases of:
   - **FXMaster 8.x** (8.0.0 is its first v14 release)
   - **Calendaria**, **Simple Calendar Reborn** and the **Simple Calendar fork**, whichever have v14 builds
   - **Quench** (for tests)
   - **Developer Mode** (optional)
3. Create one test world, and in it:
   - one plain scene
   - one scene with **2+ Levels** (the new v14 feature)

**Check:** `npm run debug && npm run linkdata14 && npm run foundry14` loads the world with Simple Weather enabled.

### ☐ Step 2. Baseline smoke test (no code changes yet)

Run this pass with **no calendar module enabled** and FX set to **Core**. Keep the browser console open.

1. Load the world as a GM. Note every red error and every yellow deprecation warning that mentions `simple-weather`. You should expect warnings for:
   - `renderTemplate`
   - `FormApplication`
   - `Dialog`
2. Open and close the weather window, drag it, toggle every bar, and regenerate the weather.
3. Turn on **Settings → Simple Weather → FX by scene**, then open **Configure Scene** on a scene. Check whether it throws `Format of SceneConfig sheet invalid` (this is what Step 3 fixes).
4. Open the **Custom weather messages** settings menu and save it.
5. Use a player client to check that the weather updates when the GM changes it.
6. On the multi-Level scene, turn FX on and switch Levels. Check that rain or snow shows on each Level.

Keep your notes from this pass; later steps refer back to them.

---

## Part B: Required fixes

### ☐ Step 3. Fix the Scene Config injection

**Why:** v14 rebuilt the Scene Config sheet into tabs: Basics, Grid, Levels, Visibility, Environment, Misc. The weather dropdown is now on **Basics**.

The hook has three problems:

- It finds the weather dropdown by running a regex over `outerHTML` and **throws** if nothing matches.
- It reads `app.object`, which doesn't exist on AppV2 sheets. That means it has always shown the flag for the *currently viewed* scene instead of the scene being edited, so this is also a v13 bug.
- With v14's multi-part rendering, the hook can fire more than once for the same sheet.

**Files:** `src/main.ts` (the `renderSceneConfig` hook, lines ~146–203)

**Do:** Replace the body of the hook with roughly this:

```ts
Hooks.on('renderSceneConfig', async (app: SceneConfig, html: HTMLElement) => {
  if (!isClientGM() || !ModuleSettings.get(ModuleSettingKeys.FXByScene))
    return;

  // v14 renders by parts and this hook can fire repeatedly; don't inject twice
  if (html.querySelector('#swr-scene-fx-active'))
    return;

  const scene = app.document;   // NOT app.object
  const currentSceneFX = SceneSettings.get(SceneSettingKeys.fxActive, scene);

  const injection = `...same fieldset markup as today...`;

  // anchor on the weather <select> directly, wherever the sheet puts it
  const anchor = html.querySelector('[name="weather"]')?.closest('.form-group');
  if (!anchor) {
    console.warn('simple-weather | Could not find weather field in SceneConfig; skipping injection');
    return;   // don't throw - that breaks the whole sheet for the GM
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
    weatherApplication.render();
  });

  app.setPosition({ height: 'auto' });   // see Check below - may no longer be needed
});
```

- Delete the `matchElementById` regex and both `throw new Error('Format of SceneConfig sheet invalid')` lines.
- Optional: move the hard-coded "FX on" / "Should FX be used on this scene?" strings into `static/lang/*.json` while you're here.

**Check:**

- Scene Config opens without errors on both v13 and v14.
- The checkbox appears right under Weather on the Basics tab.
- Switch tabs and back: the checkbox appears only once.
- Edit a *non-active* scene: its checkbox reflects *that* scene's flag, and toggling it doesn't change FX on the scene you're viewing.
- If `setPosition({ height: 'auto' })` makes the tabbed sheet jump in size, remove it.

### ☐ Step 4. Fix the scene default-setting bug in `SceneSettings.get`

**Why:** When a flag is missing, `get()` writes the default to the *current* scene, even when you passed a different scene. Step 3 now passes other scenes, so this becomes visible.

**Files:** `src/settings/SceneSettings.ts` (~line 40)

**Do:**

```ts
// before
void SceneSettings.set(setting, value);
// after
void SceneSettings.set(setting, value, sceneToUse ?? undefined);
```

**Check:** Open Scene Config on a never-configured, non-active scene. The `swr-fxActive` flag is written to *that* scene, not the active one. You can verify with `game.scenes.getName('X').flags['simple-weather']`.

### ☐ Step 5. Verify and port the FXMaster integration

**Why:** FXMaster 8.x is a rewrite for v14. It adds `FXMASTER.api.effects` (play/stop/toggle) and per-Level placement. Simple Weather depends on three older FXMaster entry points that may have changed or been removed. I couldn't confirm their status.

**Files:** `src/weather/WeatherEffects.ts`, `src/weather/effectsMap.ts`

**Do:**

1. **Investigate first.** With FXMaster 8.x on v14, run these in the console:
   - `FXMASTER.filters?.addFilter`. Does it still exist?
   - `Object.keys(FXMASTER.api ?? {})` and `FXMASTER.api?.effects`. What's the new surface?
   - Trigger `Hooks.call('fxmaster.switchParticleEffect', {name:'swr-test', type:'rain', options:{}})`. Does rain appear?
   - Check `canvas.scene.flags.fxmaster` after adding an effect through FXMaster's own UI. Are the keys still `effects` and `filters`?
   - Read the FXMaster 8.0.0 release notes and README on GitHub (gambit07/fxmaster) for the migration notes.
2. **If the old APIs are gone**, update these four places:
   - Particle add: `WeatherEffects.ts` ~line 148, `Hooks.call('fxmaster.switchParticleEffect', …)`
   - Filter add: ~line 160, `FXMASTER.filters.addFilter(…)`
   - Removal: ~lines 189–207. This reads the `fxmaster.effects` / `fxmaster.filters` scene flags to find `swr-*` names, then calls the hook or `removeFilter`.
   - Effect type names and option shapes in `effectsMap.ts` (the `fxMaster` entries)

   If you want to keep v13 / FXMaster 6–7 users working, branch on the major version:
   ```ts
   const fxmVersion = game.modules.get('fxmaster')?.version ?? '0';
   const useNewFxmApi = !VersionUtils.isMoreRecent('8.0.0', fxmVersion); // i.e. >= 8.0.0
   ```
3. Decide how **per-Level placement** should behave: weather on all Levels, or only the viewed Level. If FXMaster 8's API takes a level argument, wire that up.
4. Update the version check in the `WeatherEffects` constructor (~lines 40–52), which currently only requires `>= 3.0.0`. On v14, warn if FXMaster is below 8.0.0.

**Check:** Every row in `effectsMap.ts` that has `fxMaster` entries:

- starts the right particles and filters
- clears them when the weather changes or FX is toggled off
- leaves no orphaned `swr-*` effects in FXMaster's own effect list

Test the multi-Level scene too.

### ☐ Step 6. Update each calendar adapter for its v14 release

**Why:** Attached mode depends on each calendar's internal DOM and APIs, which change between builds.

**Files:** `src/calendar/CalendarManager.ts`, `src/calendar/CalendariaAdapter.ts`, `src/calendar/SimpleCalendarRebornAdapter.ts`, `src/calendar/SimpleCalendarAdapter.ts`, `test/calendarTestHelper.ts`

For **each** calendar that has a v14 build:

1. Enable only that calendar.
2. Check whether the console shows a "version prior to minimum" or "Preferred version is…" notice.
3. Update `minimumVersion` / `preferredVersion` in `CALENDAR_MODULES` (`CalendarManager.ts` lines ~32–49).
4. Test floating mode: the date shows and updates when time advances (`updateWorldTime` hook).
5. Test attached mode: open the panel from the calendar's button.
6. **Calendaria:** confirm that:
   - the `#mini-calendar .mini-notes-panel` target (`CalendariaAdapter.ts` ~line 207) still exists
   - `api.registerWidget(...)` still accepts the same config
   - the hook names `calendaria.ready` and `renderMiniCalendar` are unchanged
7. **SC Reborn / SC fork:** re-derive the obfuscated class constants. The comments next to each constant explain how to find them in the DOM:
   - `SC_CLASS_FOR_TAB_EXTENDED`
   - `SC_CLASS_FOR_TAB_CLOSED`
   - `SC_CLASS_FOR_TAB_WRAPPER`
   - `SC_ID_FOR_WINDOW_WRAPPER`
   - `SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER`

   Also mirror the changed classes in the `.scss`.
8. Test forecasts:
   - Advance one day: no prompt.
   - Jump several days: the overwrite prompt appears.
9. Add the tested versions to `test/calendarTestHelper.ts`, per your `update checklist.md`.

For any calendar **without** a v14 build, note in the README that it's v13-only.

### ☐ Step 7. Re-check the WeatherApplication overrides

**Why:** `WeatherApplication` overrides AppV2 internals: the `element` getter, `render()`, and a manual `_onRender` call in attached mode. These can break silently across core versions.

**Files:** `src/applications/WeatherApplication.ts` (lines ~66–183)

**Do:** This is a test step; you change code only if something breaks. On v14, in **both** floating and attached mode:

- Open, close, re-open, and drag the window.
- Re-render it by changing biome or season.
- Reload the page while it's open.

Watch for duplicate windows, stale elements, or errors from `super._onRender`.

Also confirm the floating window doesn't appear inside v14's new pop-out (detached) windows.

---

## Part C: Deprecation cleanup (works in v14, breaks in v15/v16)

### ☐ Step 8. Namespace `renderTemplate` (breaks in v15)

**Files:** `src/applications/WeatherApplication.ts` (~line 190), `src/libraries/foundry/foundry.ts`

**Do:**

1. Make this change:
   ```ts
   // before
   const htmlString = await renderTemplate(template, context);
   // after
   const htmlString = await foundry.applications.handlebars.renderTemplate(template, context);
   ```
2. Delete `src/libraries/foundry/foundry.ts`. Nothing imports it, and it wraps `window.renderTemplate` and `window.srcExists`, which are both deprecated globals. If you want to be sure first, run `grep -rn "libraries/foundry" src test`.

**Check:** No `renderTemplate` deprecation warning in the console in attached mode.

### ☐ Step 9. Replace `Dialog.confirm` with `DialogV2.confirm` (breaks in v15 as a global, v16 entirely)

**Files:** `src/weather/GenerateWeather.ts` (~line 231), `test/weather/GenerateWeather.test.ts` (~line 298)

**Do:**

```ts
shouldOverwrite = await foundry.applications.api.DialogV2.confirm({
  window: { title: localize('labels.overwriteDialogTitle') },
  content: `<p>${localize('labels.overwriteDialogContent')}</p>`,
  rejectClose: false,
  modal: true,
  yes: { default: true },   // replaces V1's defaultYes
}) ?? false;
```

In the test:

```ts
dialogStub = sinon.stub(foundry.applications.api.DialogV2, 'confirm').callsFake(() => dialogMockReturn);
```

**Check:**

- Jump the calendar several days: the prompt appears, and Yes is the default button.
- Closing the dialog with X counts as "no".
- The Quench `GenerateWeather` tests pass.

### ☐ Step 10. Port `CustomMessageSettingsApplication` to ApplicationV2 (breaks in v15 as a global, v16 entirely)

**Files:** `src/applications/CustomMessageSettingsApplication.ts`, `static/templates/custom-message-settings.hbs`

**Do:**

1. Rewrite the class. The flattening logic and the save logic stay the same; only the framework wrapper changes.
   ```ts
   const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

   export class CustomMessageSettingsApplication extends HandlebarsApplicationMixin(ApplicationV2) {
     static DEFAULT_OPTIONS = {
       id: 'swr-custom-message-settings',
       tag: 'form',
       window: { title: 'swr.settings.customWeather', resizable: true },
       position: { width: 800, height: 700 },
       form: {
         handler: CustomMessageSettingsApplication.onSubmit,
         submitOnChange: false,
         closeOnSubmit: true,
       },
     };

     static PARTS = {
       form: { template: `modules/${moduleJson.id}/templates/custom-message-settings.hbs`, scrollable: [''] },
       footer: { template: 'templates/generic/form-footer.hbs' },
     };

     private _flattenedDescriptions = [] as { /* same shape as today */ }[];

     constructor(options = {}) {
       super(options);
       // ...same flattening code as the current constructor...
     }

     async _prepareContext(options) {
       const currentText = ModuleSettings.get(ModuleSettingKeys.customChatMessages);
       for (const d of this._flattenedDescriptions)
         d.currentText = currentText[d.climateId][d.humidityId][d.descriptionId];

       return {
         ...(await super._prepareContext(options)),
         weatherDescriptions: this._flattenedDescriptions,
         buttons: [{ type: 'submit', icon: 'fa-solid fa-floppy-disk', label: 'SETTINGS.Save' }],
       };
     }

     // AppV2 calls the form handler with `this` bound to the app instance
     private static async onSubmit(this: CustomMessageSettingsApplication, _event: SubmitEvent, _form: HTMLFormElement, formData: FormDataExtended) {
       const data = formData.object as Record<string, string>;
       // ...same body as today's _updateObject, reading data['v-' + i]...
     }
   }
   ```
   Delete the old `defaultOptions`, `getData` and `_updateObject`.
   - The `title` is a localization key; AppV2 localizes it for you. Use whichever `swr.*` key you want shown.
   - If `SETTINGS.Save` isn't a core key in your Foundry version, use your own `swr.*` key.
2. Rewrite the template. AppV2 provides the outer `<form>`, and every part needs **exactly one root element**:
   ```hbs
   <div class="swr-custom-messages">
     <table>
       {{#each weatherDescriptions}}
         <tr>
           <td><b>{{climate}}&nbsp;</b></td>
           <td><b>{{humidity}}&nbsp;</b></td>
           <td>{{description}}</td>
           <td><input type="text" name="v-{{@index}}" value="{{currentText}}"/></td>
         </tr>
       {{/each}}
     </table>
   </div>
   ```
   Remove the `<form>` tag and both Submit buttons; the footer part supplies the button.
3. `ModuleSettings.ts` (~line 156) needs no change: `registerMenu` accepts an AppV2 class as `type`.

**Check:**

- Settings → Configure Settings → Simple Weather → Custom weather messages opens, scrolls, and saves.
- Re-opening shows the saved values.
- A manual weather post to chat includes the custom text.
- No `FormApplication` deprecation warning.

### ☐ Step 11. Remove jQuery from `WeatherApplication._onRender`

**Why:** jQuery still ships with v14, but core is steadily removing it from APIs and hooks. This is the biggest jQuery user in the module.

**Files:** `src/applications/WeatherApplication.ts` (`_onRender` ~lines 335–401, plus handler signatures)

**Do:**

1. At the top of `_onRender`, replace the `$()` wrapper with two small helpers:
   ```ts
   const root = this.element;
   const on = (id: string, type: string, handler: (e: Event) => void) =>
     root.querySelector(`#${id}`)?.addEventListener(type, handler as EventListener);
   const setValue = (id: string, value: unknown) => {
     const el = root.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
     // jQuery's .val(undefined) was a no-op getter - preserve that
     if (el && value !== undefined && value !== null) el.value = String(value);
   };
   ```
2. Mechanically convert each line:
   - `html.find('#x').val(v)` → `setValue('x', v)`
   - `html.find('#x').on('evt', fn)` → `on('x', 'evt', fn)`
   - The temperature block, which checks the field and fills it in if empty:
     ```ts
     const tempElement = root.querySelector<HTMLInputElement>('#swr-manual-temperature');
     if (tempElement && !tempElement.value) this.onManualWeatherChange(false);
     ```
3. Update the handler types:
   - `onMoveHandleMouseDown(event: JQuery.MouseDownEvent)` → `(event: MouseEvent)`
   - `onManualTempInput(event?: JQuery.Event)` → `(event?: Event)`
   - The inline `JQuery.KeyDownEvent` / `JQuery.KeyUpEvent` → `KeyboardEvent`
4. Optional, larger change: move click handlers to AppV2 `actions`. Add `data-action="regenerate"` etc. in `weather-dialog.hbs` and map them in `DEFAULT_OPTIONS.actions`. This removes the per-render listener wiring, but attached mode bypasses AppV2 rendering, so actions won't fire there. Only do this if you also rework attached mode.

**Check:** Every button, select, toggle, drag handle and the manual temperature field still works, in floating *and* attached mode, as both GM and player.

### ☐ Step 12. Remove jQuery from the calendar adapters

**Files:**

- `src/calendar/ICalendarAdapter.ts`
- all three adapters
- `src/applications/WeatherApplication.ts` (`_renderInAttachedMode`)
- `test/calendar/adapters.test.ts` (~line 404)

**Do:**

1. Change the interface to take an HTML string; it's the simplest swap:
   ```ts
   inject(html: string, hidden: boolean): string;
   ```
2. In `_renderInAttachedMode`, delete `const html = $(htmlString);` and pass `htmlString` straight to `adapter.inject(...)`.
3. In each adapter's `inject` / `activateListeners`, use these swaps:

   | jQuery | Vanilla |
   |---|---|
   | `$('#id').length === 0` | `!document.getElementById(id)` |
   | `target.after(html)` | `target.insertAdjacentHTML('afterend', html)` |
   | `$('#id').replaceWith(html)` | `document.getElementById(id)!.outerHTML = html` |
   | `.addClass(c)` / `.removeClass(c)` | `.classList.add(c)` / `.classList.remove(c)` |
   | `$(el).hasClass(c)` | `(el as HTMLElement).classList.contains(c)` |
   | `$(sel).find(sub)` | `document.querySelectorAll(\`${sel} ${sub}\`)` |
   | `.last().parent()` | `const all = document.querySelectorAll(...); all[all.length - 1]?.parentElement` |
   | `$(sel).remove()` | `document.querySelector(sel)?.remove()` |

   For collections, such as `existingPanels.addClass(...).removeClass(...)`, use `.forEach(el => el.classList…)`.
4. **SC adapters' `renderMainApp` hook:** SC is an AppV1 app, so it still passes jQuery. Normalize the argument so the hook works whichever SC passes:
   ```ts
   Hooks.on('renderMainApp', (_app, html: JQuery | HTMLElement) => {
     const root = html instanceof HTMLElement ? html : html[0];
     const compactMode = !!root.querySelector(`.${SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER}`);
     // ...convert the rest with the table above;
     //    .on('click', fn) -> .addEventListener('click', fn)
   });
   ```
5. Test: change `const mockHtml = $('<div id="test-container"></div>')` to the plain string `'<div id="test-container"></div>'`.

**Check:**

- Attached mode works with each calendar.
- Opening another calendar panel hides the weather panel. This is the MutationObserver in the SC adapters.
- `grep -rn '\$(' src` returns nothing.

### ☐ Step 13. Tidy the AppV2 options on `WeatherApplication`

**Files:** `src/applications/WeatherApplication.ts` (~lines 69–72, ~line 162)

**Do:**

1. `DEFAULT_OPTIONS` uses `popOut: false` and `resizable: false`. These are AppV1 option names, so AppV2 ignores them. The AppV2 equivalent is:
   ```ts
   static DEFAULT_OPTIONS = {
     window: { frame: false, positioned: false, resizable: false },
   };
   ```
   ⚠️ This changes how the app is wrapped, so test the floating window's look and position carefully. If it changes, revert; it isn't required for v14.
2. Change the `close` signature from `close(options?: Application.CloseOptions): Promise<void>` to:
   ```ts
   close(options?: foundry.applications.api.ApplicationV2.ClosingOptions)
   ```

**Check:** The window looks and positions exactly as before, and `npm run tsc` is clean for this file.

---

## Part D: Small cleanups

### ☐ Step 14. Playlist fixes

**Files:** `src/utils/playlist.ts`

**Do:**

1. In `Playlist.create` (~line 67), change `permission: { default: 0 }` to:
   ```ts
   ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }
   ```
   `permission` was renamed `ownership` back in v10, so today the key is silently dropped.
2. Around line 101, change `channel: 'environment'` to `channel: CONST.AUDIO_CHANNELS.environment`.

**Check:**

- Delete the "Simple Weather" playlist and reload: it's recreated, and players can't see it.
- Sounds play on the Environment volume slider.

---

## Part E: Tooling and tests

### ☐ Step 15. Types, Quench, CI

**Files:** `package.json`, `.github/workflows/test.yml`, `.github/workflows/release.yml`

**Do:**

1. **Pin the types.** `@types/fvtt-types` currently tracks `github:League-of-Foundry-Developers/foundry-vtt-types#main`, which is unpinned. There's no stable v14 types release yet. The npm `fvtt-types@beta` tag is `14.370.0-beta.20261107215328`. Either pin that, or pin `#main` to a specific commit SHA. Then run `npm install && npm run tsc` and fix what shows up. Expect hits on:
   - `Application.CloseOptions` (done in Step 13)
   - `ClientSettings.SettingSubmenuConfig`
   - `SceneConfig`
   - anything typed with `JQuery`
2. **Quench:** bump `@ethaks/fvtt-quench` to a release that supports v14, and install the matching Quench module in your v14 world.
3. **CI image:** `ghcr.io/dovrosenberg/simple-weather-testing:latest` is presumably v13.
   - Build a v14 image, e.g. tag `:v14`.
   - Ideally run `test.yml` as a matrix over `:v13` and `:v14`, if you're keeping v13 support.
4. **Release workflow (optional):** bump `actions/checkout@v3` → `v4` and Node 18 → 20+.
5. **Optional housekeeping:**
   - Remove the unused `.gitlab-ci.yml` and the old `Dockerfile`.
   - Remove the committed `tsconfig.tsbuildinfo` and add it to `.gitignore`.

**Check:** `npm run tsc` is clean, `npm run build` succeeds, and the full Quench suite passes in the v14 world. Run all Quench tests from the Quench UI.

---

## Part F: Release

### ☐ Step 16. Manifest, docs, release

**Files:**

- `static/module.json`
- `README.md`
- `CHANGELOG.md`
- `package.json`
- `update checklist.md`

**Do:**

1. In `module.json`, update `compatibility`:
   ```json
   "compatibility": { "minimum": "13", "verified": "14.370" }
   ```
   Keep `minimum: "13"` unless you hit something that forces dropping v13; nothing above does. Use whichever 14.x build you actually tested on.
2. In `README.md`, add a "Note on v14 compatibility" section listing:
   - supported calendar versions on v14, and which calendars are v13-only
   - the FXMaster minimum (8.x on v14)
   - how weather behaves with multiple Levels
3. In `CHANGELOG.md`, add a new version entry covering:
   - v14 support
   - the SceneConfig fix and the "wrong scene" FX-flag bug fix
   - the FXMaster 8 support
   - the supported calendar versions
4. Bump `version` in `package.json`.
5. In `update checklist.md`, add "smoke test on latest v13 and v14".
6. Publish the release, then update the compatibility on the Foundry package page.

---

## Quick reference: what *doesn't* need changing

I checked these against the v14 type definitions; no change is needed:

- `Scene#weather` / `scene.update({ weather })`: still one field per scene, and Levels don't have their own.
- Core weather effect IDs `rain`, `rainStorm`, `fog`, `snow`, `blizzard`: all still in `CONFIG.weatherEffects`.
- `ChatMessage.create({ speaker, whisper, content })` and `ChatMessage.getWhisperRecipients`.
- `game.settings.register` / `registerMenu`, `game.keybindings.register`, and scene/user flags.
- The `getSceneControlButtons` structure (v13 format is unchanged in v14).
- The `init`, `setup`, `ready`, `i18nInit`, `updateSetting`, `canvasInit` and `updateWorldTime` hooks.
- `foundry.utils.randomID` / `deepClone`. You already use the namespaced versions.
