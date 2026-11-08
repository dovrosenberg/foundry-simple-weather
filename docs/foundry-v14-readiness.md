# Foundry VTT v14 Readiness Assessment — Simple Weather

_Assessed: 2026-11-08 against Simple Weather v2.2.2 (`master` @ `e6ff685`). Latest Foundry stable: **14.370** (V14 Stable 12, 2026-11-02)._

## Summary

**Overall: likely close to working on v14 already, but not verified, and there are a few real risks.**

Simple Weather avoided the v12 globals that v14 removed: it already uses `foundry.utils.*`, avoids `ChatMessage#user`, `CHAT_MESSAGE_TYPES`, and the bare `AudioHelper`/`Sound` globals. Its main window is already ApplicationV2. The core weather API it depends on still exists in v14:

- `Scene#weather` is still a single scene-wide string field, not per-Level.
- The `CONFIG.weatherEffects` keys it uses (`rain`, `rainStorm`, `fog`, `snow`, `blizzard`) all still exist.

The remaining work falls into four buckets:

1. **Blockers / high risk.** These need hands-on testing and probably code changes: the SceneConfig injection (the sheet was restructured for Levels), the FXMaster integration (FXMaster 8.x is a rewrite for v14), and calendar-module v14 support.
2. **Deprecation warnings.** These work in v14 but break in v15/v16: `renderTemplate`, `Dialog`, `FormApplication`, and jQuery-based hooks.
3. **Latent bugs found during review.** These are not v14-specific but surfaced here.
4. **Tooling / release.** Types, the test container, manifest, and docs.

### Legend

- 🔴 Must fix or verify before claiming v14 support
- 🟡 Works in v14 with console deprecation warnings; breaks in v15 or v16
- 🟢 Cleanup or nice-to-have
- ✅ Checked, no change needed

---

## 1. Manifest & release (🔴)

- [ ] **Update `static/module.json` compatibility**: currently `minimum: "13"`, `verified: "13.351"`.
  - Set `verified` to `"14.370"` (or whichever build you test on) once testing passes.
  - Decide whether to keep v13 support. Keeping it is feasible; nothing below requires dropping v13.
  - As of 14.366, Foundry checks for updates against the website package repository, so `verified` matters more.
- [ ] Update the Foundry package listing (website) compatibility after release.
- [ ] Add a "Note on v14 compatibility" section to `README.md`, including which calendar and FXMaster versions are supported on v14.
- [ ] Update `CHANGELOG.md` and the `update checklist.md` steps (add a v14 test pass).
- [ ] `package.json` scripts: `linkdata`, `unlinkdata`, `rmfolder` and `copy` still point to `~/foundry13data`; `foundry14` exists. Add v14 equivalents so building and testing against v14 is one command.

## 2. Scene Config injection — `src/main.ts:146-203` (🔴)

v14 rebuilt `SceneConfig` for Scene Levels (foundryvtt#13765, 14.354).

- Its parts are now `tabs`, `basics`, `grid`, `levels`, `visibility`, `environment`, `misc` and `footer`.
- The **weather `<select>` now renders in the `basics` part** and tab.

The hook currently does three things:

1. Regex-searches `html.outerHTML` for an element id matching `SceneConfig-Scene-*-weather`.
2. Inserts the "FX on" fieldset after that element's `.form-group`.
3. Throws `Error('Format of SceneConfig sheet invalid')` if nothing matches.

Tasks:

- [ ] **Verify the weather field's id/name in v14**. Open SceneConfig on v14 and confirm the regex still matches. If it doesn't, every GM gets an uncaught error each time a Scene sheet opens while "FX by scene" is on.
- [ ] Replace the `outerHTML` regex with a direct selector, e.g. `html.querySelector('[name="weather"]')?.closest('.form-group')`. This is more robust across v13/v14.
- [ ] **Don't throw on a missing anchor**. Log a warning and fall back to appending to the basics tab (`.tab[data-tab="basics"]`), or skip injecting.
- [ ] The hook fires on **every part re-render**. Because v14 uses `PARTS`, guard against injecting twice (check for `#swr-scene-fx-active` first), and make sure the anchor's part was actually rendered (`options.parts`).
- [ ] **Bug (also affects v13):** `SceneSettings.get(..., app.object)` at `main.ts:154`. `SceneConfig` is a `DocumentSheetV2`, which exposes `app.document`, not `app.object`. Today `app.object` is `undefined`, so the checkbox shows the **currently viewed** scene's flag rather than the scene being edited. The change handler at `main.ts:191-196` has the same problem: `weatherEffects.setFxActive` writes to `SceneSettings.currentScene`. Use `app.document` and write the flag to that scene.
- [ ] Verify against v14 system-specific Scene sheets. Some systems override `TABS`, which hides injected content.
- [ ] Re-check `app.setPosition({ height: 'auto' })` with the tabbed layout. The tab content is scrollable now, so this may be unnecessary.

## 3. Core weather effects — `src/weather/WeatherEffects.ts` (🔴 verify / 🟢)

- ✅ `Scene#weather` is still a scene-wide `StringField`. The new embedded `Level` document has **no** weather field, so `scene.update({ weather })` remains valid.
- ✅ `CONFIG.weatherEffects` still includes `rain`, `rainStorm`, `fog`, `snow` and `blizzard`, the only keys `effectsMap.ts` uses. v14 adds `leaves`.
- ✅ The `canvasInit` hook and `canvas.scene` are unchanged.
- [ ] **Test with a multi-Level scene**. Confirm that core weather renders on every Level, or at least on the viewed Level, and that switching Levels doesn't reset it.
- [ ] Check whether the new `Level` visibility / `restrictsWeather` occlusion settings need a note in the README. For example, indoor levels might suppress weather.
- [ ] 🟢 Core `ParticleEffect`-based weather is deprecated in v14 and planned for removal in v16, replaced by `ParticleGenerator` (foundryvtt#14074, #13836). This only affects you if you ever define custom `CONFIG.weatherEffects` entries; the module doesn't today. No action is needed now.

## 4. FXMaster integration — `src/weather/WeatherEffects.ts`, `src/weather/effectsMap.ts` (🔴)

FXMaster **8.0.0 is the v14 release** (current 8.4.2). It added `FXMASTER.api.effects` (play/stop/toggle) and per-Level placement, and dropped v12. Simple Weather depends on four FXMaster APIs that may have changed:

| Usage | Where | v14 status |
|---|---|---|
| `Hooks.call('fxmaster.switchParticleEffect', {name, type, options})` | `WeatherEffects.ts:148-152, 201` | **Unverified**: may be replaced by `FXMASTER.api.effects` |
| `FXMASTER.filters.addFilter(name, type, options)` / `removeFilter(name)` | `WeatherEffects.ts:160, 206` | **Unverified** |
| Reading scene flags `fxmaster.effects` / `fxmaster.filters` to find `swr-*` effects | `WeatherEffects.ts:189-190` | **Unverified**: internal storage; likely changed with per-Level placement |
| Particle type names and option shapes in `effectsMap.ts` | `effectsMap.ts` | **Unverified** |

- [ ] Install FXMaster 8.x on v14 and test every particle and filter effect combination in `effectsMap.ts`.
- [ ] If the hook/flag API is gone, port to `FXMASTER.api.effects`. Branch on the FXMaster major version so v13 users on FXMaster 6/7 keep working.
- [ ] Decide how per-Level placement should behave: scene-wide, or the active Level only.
- [ ] Update the version check at `WeatherEffects.ts:40-52`. It only enforces `>= 3.0.0`; add a minimum (or a separate code path) for v14.

## 5. Calendar module dependencies — `src/calendar/*` (🔴, mostly external)

Attached mode and date sync depend on third-party calendars being v14-ready.

- [ ] **Simple Calendar (CarlosFdez fork)**: confirm it runs on v14. If not, document that it's v13-only.
- [ ] **Simple Calendar Reborn**: confirm the v14 version. Re-derive the obfuscated class names (`SC_CLASS_FOR_TAB_EXTENDED`, `SC_CLASS_FOR_TAB_WRAPPER`, `SC_ID_FOR_WINDOW_WRAPPER`, `SC_CLASS_FOR_COMPACT_BUTTON_WRAPPER`) in `SimpleCalendarRebornAdapter.ts`; they change with every SC build.
- [ ] **Calendaria**: confirm the v14 version. Bump `minimumVersion` / `preferredVersion` in `CalendarManager.ts:32-49`; currently `0.8.3`. Re-verify:
  - the `#mini-calendar .mini-notes-panel` injection target (`CalendariaAdapter.ts:207`)
  - the `registerWidget` API
  - the `calendaria.ready` and `renderMiniCalendar` hooks
- [ ] **v14 core change to watch:** 14.370 changed `CalendarData#onUpdateWorldTime` to receive `deltaTime`. Simple Weather doesn't call it directly, but calendar modules do, which is another reason to require their v14 builds.
- [ ] Re-test the `updateWorldTime` hook flow (`main.ts:244`) and forecast generation on v14.
- [ ] The `renderMainApp` hook (SC adapters) receives jQuery because SC is AppV1. That's fine while SC stays V1; see §7.

## 6. ApplicationV1 usage (🟡: deprecated since v13, **removed in v16**)

- [ ] **`CustomMessageSettingsApplication`** (`src/applications/CustomMessageSettingsApplication.ts`) extends the global `FormApplication`.
  - v14 warns twice: once for the global access (moved to `foundry.appv1.api.FormApplication`, global removed in v15) and once for AppV1 itself (removed in v16).
  - Port it to `HandlebarsApplicationMixin(ApplicationV2)` with `tag: 'form'`, `form: { handler, submitOnChange: false, closeOnSubmit: true }`.
  - Update `static/templates/custom-message-settings.hbs`: drop the outer `<form>`, use the `form-footer` part or a submit button.
  - It's registered as a settings menu `type` in `ModuleSettings.ts:156`; AppV2 classes work there.
- [ ] **`Dialog.confirm`** (`src/weather/GenerateWeather.ts:231`) uses the V1 global.
  - Replace it with `foundry.applications.api.DialogV2.confirm({ window: { title }, content, rejectClose: false, modal: true })`.
  - DialogV2 has no `defaultYes`; use `yes: { default: true }`.
  - Update the sinon stub in `test/weather/GenerateWeather.test.ts:298` to stub `DialogV2.confirm`.

## 7. Deprecated globals & jQuery (🟡: global namespace removals land in v15)

- [ ] **`renderTemplate` global**: `src/applications/WeatherApplication.ts:190`. Use `foundry.applications.handlebars.renderTemplate`. Warns in v14, removed in v15.
- [ ] **`src/libraries/foundry/foundry.ts`** wraps `window.renderTemplate` / `window.srcExists`. Nothing appears to import it; delete it, or update it if something does.
- [ ] **jQuery in `WeatherApplication._onRender`** (`WeatherApplication.ts:335-401`) wraps the root in `$()` and wires about 25 handlers with `.find().on()`.
  - Foundry still bundles jQuery in v14, so this works.
  - Core is steadily removing jQuery from hooks and APIs (`chatBubble`, `renderChatMessage`, etc. are deprecated until v15).
  - Recommended: convert to vanilla DOM, or better, AppV2 `actions` (`data-action` in the template) plus `change` listeners. That also removes the manual event re-binding on every render.
- [ ] **jQuery in the calendar adapters**: the `inject(html: JQuery, …)` signature in `ICalendarAdapter.ts` and the `$()` calls in all three adapters. Convert to `HTMLElement` / `DocumentFragment` together with the item above. `_renderInAttachedMode` builds `$(htmlString)` only to pass it to `inject`.
- [ ] Test files: `test/calendar/adapters.test.ts:404` builds jQuery mocks; update them alongside.

## 8. WeatherApplication (ApplicationV2) internals (🔴 verify / 🟢)

The main window is ApplicationV2, but it relies on overrides of AppV2 internals that could break silently across versions:

- [ ] It overrides the `element` getter (`WeatherApplication.ts:84-104`) to return an injected element in attached mode. **Smoke-test on v14** that render, close and re-render work in both floating and attached mode.
- [ ] It overrides `render()` to bypass AppV2 entirely in attached mode and calls `_onRender` manually (`WeatherApplication.ts:148-183`). This is fragile; confirm `super._onRender` doesn't assume a framework-created element in v14.
- [ ] 🟢 `DEFAULT_OPTIONS` uses `popOut: false` and `resizable: false`, which are AppV1 option names; AppV2 ignores them. Use `window: { frame: false, positioned: false, resizable: false }` and confirm the floating window still looks right. A frameless AppV2 is the supported route instead of a "non-popout" V1-style app.
- [ ] 🟢 The `close(options?: Application.CloseOptions)` signature uses V1 types. Switch to `ApplicationV2.ClosingOptions`.
- [ ] Check for interaction with v14 **detached windows** (new `openDetachedWindow` / `closeDetachedWindow` hooks). The custom-positioned fixed `#swr-container` shouldn't be affected, but verify it doesn't appear in pop-out windows.

## 9. Playlist / sounds — `src/utils/playlist.ts` (✅ / 🟢)

- ✅ `Playlist.create`, `createEmbeddedDocuments('PlaylistSound', …)`, `playlist.playSound`, `stopAll` and `sounds.getName` are unchanged in v14.
- ✅ The module doesn't use any of the audio APIs v14 removed: `PlaylistSound#effectiveVolume`, `AudioHelper`/`Sound` globals, `Sound#play(offset)`.
- [ ] 🟢 `Playlist.create({ permission: { default: 0 } })` at `playlist.ts:67`: `permission` was renamed `ownership` back in v10, so this key is silently dropped. Change it to `ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }`.
- [ ] 🟢 Use `CONST.AUDIO_CHANNELS.environment` instead of the string literal (`playlist.ts:101`).
- [ ] Test that sounds play on the `environment` channel in v14 and respect the volume mapping.

## 10. Chat messages — `src/weather/GenerateWeather.ts:175-181` (✅)

- ✅ Uses `ChatMessage.create({ speaker: { alias }, whisper, content })`; there's no `user` field, `type` or `rollMode`. `speaker` and `whisper` are unchanged in v14.
- ✅ `ChatMessage.getWhisperRecipients('GM')` is still present.
- [ ] 🟢 Optional: v14 replaces roll modes with **message modes** (`messageMode` option, `CONFIG.ChatMessage.modes`). The public/GM-whisper toggle could use `ChatMessage.create(data, { messageMode: 'gm' })` for consistency with core, but the current `whisper` array works.
- [ ] 🟢 Optional: v14 adds a `title` field on ChatMessage; it could replace the `speaker.alias` header hack.

## 11. Settings, keybindings, scene controls, hooks (✅)

- ✅ `game.settings.register` / `registerMenu` (including the `NumberField` type), `game.keybindings.register` with `CONST.KEYBINDING_PRECEDENCE`, and scene/user flags: no v14 changes found.
- ✅ `getSceneControlButtons` uses the v13 record shape (`controls.notes.tools[...]`, `onChange`, `button: true`), which is unchanged in v14.
- ✅ The `init`, `setup`, `ready`, `i18nInit`, `updateSetting`, `canvasInit` and `updateWorldTime` hooks are unchanged.
- ✅ The module uses no `-=key` deletion syntax. v14 deprecates it in favor of `ForcedDeletion` (foundryvtt#13090).
- [ ] 🟢 The `updateSetting` hook (`main.ts:107`) could additionally use v14's new `clientSettingChanged` hook, though it isn't needed. The world setting it watches still fires `updateSetting`.

## 12. Tooling, types & tests (🔴 for testing / 🟢 otherwise)

- [ ] **Types**: `@types/fvtt-types` points at `github:League-of-Foundry-Developers/foundry-vtt-types#main`, an unpinned moving target. There's no stable v14 types release yet.
  - npm `fvtt-types@beta` is `14.370.0-beta.20261107215328`.
  - Pin to a specific v14 beta, or to a commit, and run `npm run tsc` to surface v14 type errors and deprecations.
  - Expect the `Application.CloseOptions`, `ClientSettings.SettingSubmenuConfig` and `SceneConfig` types to need adjustment.
- [ ] **Quench** `@ethaks/fvtt-quench ^0.9.2`: confirm there's a v14-compatible Quench release, and bump.
- [ ] **CI test container** `ghcr.io/dovrosenberg/simple-weather-testing:latest` is presumably a v13 image. Build a v14 image, and ideally run both in a matrix.
- [ ] Run the full Quench suite on v14, especially `test/applications`, `test/calendar/adapters.test.ts` and `test/weather/GenerateWeather.test.ts`, which touch DOM, jQuery and Dialog stubs.
- [ ] 🟢 Not v14-specific, but stale:
  - `release.yml` uses Node 18 and `actions/checkout@v3`.
  - `vite ^2.7.2`.
  - `.gitlab-ci.yml` and the `Dockerfile` (alpine 3.14, Node 16/17) look unused.
  - `tsconfig.tsbuildinfo` is committed.

## 13. Translations (✅)

No new strings are required for v14 unless the SceneConfig fieldset labels are localized. They're hard-coded English today ("FX on", "Should FX be used on this scene?"). Consider moving them to `lang/*.json` while touching that code.

---

## Suggested order of work

1. **Smoke test on 14.370.** Set up the v14 data folder and npm scripts, then load the module with no calendar and core FX only. Watch the console for deprecation warnings and errors.
2. **SceneConfig fix** (§2), including the `app.object` → `app.document` bug.
3. **FXMaster 8.x** testing and port (§4).
4. **Calendar modules** on v14: test each one and bump the version constants (§5).
5. **WeatherApplication** attached and floating mode verification (§8).
6. **Bump `module.json` `verified`**, then update the README and CHANGELOG, and release (§1).
7. Follow-up release to clear v15/v16 deprecations:
   - AppV2 port of the custom-message settings and DialogV2 (§6)
   - the `renderTemplate` namespace (§7)
   - jQuery removal (§7)
   - type and tooling updates (§12)

## Sources

- Foundry GitHub issue tracker:
  - v12 deprecations removed in v14: foundryvtt#13436
  - SceneConfig restructure: foundryvtt#13765
  - ParticleEffect deprecation: foundryvtt#14074 and #13836
  - Message modes: foundryvtt#8856
  - `-=` key deprecation: foundryvtt#13090
  - V14 milestones list
- fvtt-types `14.370.0-beta.20261107215328`, used for:
  - `Scene#weather` schema
  - `CONFIG.weatherEffects` keys
  - `SceneConfig.PARTS` / `TABS`
  - `DocumentSheetV2#document`
  - deprecation messages for `renderTemplate`, `Dialog`, `FormApplication` and AppV1 (until v16)
- FXMaster v8.0.0 release notes (github.com/gambit07/fxmaster).
- Not directly verified: the foundryvtt.com release-note pages, which were unreachable from the research environment. Release-note claims for 14.366 and 14.370 come from search summaries.
