# Change Log

## v2.2.0 - Temporary support for Simple Calendar fork
#### [_____________]

- Advancing the calendar one day will no longer prompt for overwriting forecasts.  It will just use the existing forecats and extend the extra day.  If you jump around on the calendar, you will still be prompted if you wish to overwrite, as you may not know in that scenario if there were already forecasts provided.

## v2.1.0 - Temporary support for Simple Calendar fork
#### **Support for temporary fork of Simple Calendar - v2.4.18.5 **

![](https://img.shields.io/badge/release%20date-November%206%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v2.1.0/module.zip)

- While waiting for official Simple Calendar package to be updated to v13, *CarlosFdez* has created a fork that is compatible with v13.
You can now use Simple Weather with this fork.  For those not actively following the conversation on the Simple Calendar github page, 
you can find the latest version at https://github.com/CarlosFdez/foundryvtt-simple-calendar/releases.  Use the link to the most recent `module.json`
as the URL to install from in the Foundry VTT module manager.
- Fixed potential race condition that caused Simple Calendar (or some substitutes) not to be detected at times, even when installed.  
- Fixed duplicate button showing on Simple Calendar


## v2.0.1 - Support for Foundry v13 (Caution! Read notes)
#### **No Support for Simple Calendar !??!**

![](https://img.shields.io/badge/release%20date-May%203%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v2.0.1/module.zip)

Foundry v13 had breaking changes that impacted Simple Weather.  This version works in v13, prior ones do not.

**Unfortunately, Simple Calendar doesn't currently support Foundry v13, so be forewarned that while Simple Weather will run in standalone mode, that's all you're going to get.  If you were using Simple Calendar before, this may result in some strange behavior either when you first generate weather and/or when Simple Calendar comes back. I'm pretty sure that when Simple Calendar upgrades, this version will still work correctly with it, but there's no way to test it until then.  There's an [open issue](https://github.com/vigoren/foundryvtt-simple-calendar/issues/669) on Simple Calendar requesting support - please upvote.**

FXMaster is also having issues at the moment (ex. you can't manually use it), but Simple Weather is still able to use it successfully, as far as I can tell.

Other notes:
- Also fixed a longstanding issue where lightning wouldn't turn off

## v1.20.2 - Player dialog now working (better)
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-April%2028%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.20.2/module.zip)

Players can now see the dialog properly when in non-attached mode or when SimpleCalendar is in compact mode.  There is still a bug where when SimpleCalendar is in full mode you need to put into compact and then reopen before the weather button will appear.

Also cleaned up settings so non-GM players see the right ones.

## v1.20.1 - Bug fix for active scene when first loading Foundry
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-April%2023%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.20.1/module.zip)

Active scene now respects weather FX on/off setting properly when first loading Foundry.


## v1.20.0 - Support for re-forecasting
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-March%2015%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.20.0/module.zip)

Provide option to refresh forecasts when regenerating weather. Enabled ability to regenerate weather and/or pick manual weather for a day that already had a forecast.  Enabled ability to forecast off of manually selected weather - when "naturally" consistent with the current season and biome - and highlighted when you're picking a manual weather option that's not natural.  For natural manual weather, provided default temperatures to save a step.

## v1.19.2 - Bug fix when changing climate/humidity and using forecasts
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%2028%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.19.2/module.zip)

Fixed bug where changing the climate/humidity and then regenerating a day where you already had a forecast for a different climate/humidity would break the weather.

## v1.19.1 - Assorted bug fixes
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%2026%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.19.1/module.zip)

Eliminated some obscure bugs, as well as a more severe one that sometimes caused weather to display a blank or NaN.  Also fixed
an issue from 1.18 where sounds didn't always properly stop when turning off FX for a scene.

## v1.19.0 - Added ability to control scene FX from scene configuration screen
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%2024%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.19.0/module.zip)

You can now control whether each scene displays FX (and sound) from the scene configuration screen (right click on a scene 
and select 'Configure').

## v1.18.1 - Updated language translations for 1.18
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%2022%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.18.1/module.zip)

Updated all translations.

## v1.18.0 - Sound effects!
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%2022%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.18.0/module.zip)

You can now activate sound FX when using visual FX.  For now, only built in sounds, but will look at making it more customizable in the future.

## v1.17.4 - Fixed issue with advancing calendar by partial days
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%2021%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.17.4/module.zip)

Advancing the calendar time within the same day no longer breaks the forecast.

## v1.17.3 - Big bug fixes related to weather fx
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-February%208%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.17.3/module.zip)

I guess no one's been using FXMaster effects? Because they weren't working at all for a few releases now.  But in any
case they're fixed.  You should now see FXMaster effects.  Plus when you are using scene-specific weather fx, they 
now save their state by scene vs. always starting off.

## v1.17.2 - Bug fix
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-January%2030%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.17.2/module.zip)

Fixed module crashing on load introduced in 1.17.1

## v1.17.1 - Now supporting Polish (Polski)!
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-January%2027%2C%202025-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.17.1/module.zip)

Added Polish localization support. Thanks, Lioheart.

## v1.17.0 - Ability to show date in the chat log
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-October%2026%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.17.0/module.zip)

New module setting to show the date in the chat log output to make it easier to see which weather is for which
date when skipping around (or just looking back through the log, generally).  Note that this feature requires simple calendar.

## v1.16.2 - German language update
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-October%2025%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.16.2/module.zip)

Updates to German localization to fully support v1.16.0.  Thanks, SesuUisu.

## v1.16.1 - French language update
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-October%2017%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.16.1/module.zip)

Updates to French localization to fully support v1.16.0.  Thanks, Zakarik.

## v1.16.0 - Basic forecasting
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-October%2017%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.16.0/module.zip)

Introduced a basic forecasting capability - GMs can now see the next several days of upcoming weather. See readme for more details. 

Also removed manifest warning in console.

## v1.15.2 - Bug fix for Simple Calendar compact mode
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-September%209%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.15.2/module.zip)

Fixed bug where you couldn't set weather manually when attached to a compact Simple Calendar window.

## v1.15.1 - Re-enable ability to set weather via scene settings
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-September%201%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.15.1/module.zip)

Fix to let you use the Ambiance tabe in scene settings to set weather.  Note that this will (obviously) get the weather out of sync with Simple Weather, which will confuse it.  Generally, hitting the "Toggle FX" button (that looks like the raining cloud) twice (i.e. on/off or off/on, depending on its current state) should let Simple Weather take back over.

## v1.15.0 - Workaround for FXMaster issue causing long delays in updating visual effects
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-August%2029%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.15.0/module.zip)

Workaround to FXMaster issue (https://github.com/ghost-fvtt/fxmaster/issues/761) that was causing long delays in effects 
being turned on/off.  They should now update immediately when changing scenes, applying new weather, or toggling FX on/off.  
Thanks for your patience - I know this issue has been painful to deal with.

## v1.14.1 - Updated German and French
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-August%2026%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.14.1/module.zip)

Updates to French and German localization to fully support v1.14.0.  Thanks, Zakarik and SesuUisu.

## v1.14.0 - Per scene weather FX
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-August%2026%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.14.0/module.zip)

* Ability to have FX settings apply on a scene-by-scene basis: no more toggling manually when you change between indoor/outdoor scenes!
* Changed chat messages to be global instead of whispers to everyone.


## v1.13.5 - Updated French 
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-June%2021%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.13.5/module.zip)

Updates to French localization to fully support v1.13.3.  Thanks, Zakarik.

## v1.13.4 - Updated German 
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-June%2015%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.13.4/module.zip)

Updates to German localization to fully support v1.13.3.  Thanks, SesuUisu.

## v1.13.3 - Hide configuration error messages from players
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-June%2015%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.13.3/module.zip)

Error messages about package incompatibilities are now shown only to the GM.

## v1.13.2 - Enabled localization for custom message settings
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-June%2015%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.13.2/module.zip)

Ready for pull requests to add the new localized text.

## v1.13.1 - Updated version number to support Foundry V12 release, support new version of Simple Calendar
#### Support for Simple Calendar v2.4.18
![](https://img.shields.io/badge/release%20date-May%2025%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.13.1/module.zip)

Supports Simple Calendar v2.4.18, doesn't report lack of support for Foundry v12 official release

## v1.13.0 - Support for new version of Simple Calendar
#### Support for Simple Calendar v2.4.17
![](https://img.shields.io/badge/release%20date-May%2020%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.13.0/module.zip)

Supports Simple Calendar v2.4.17

## v1.12.1 - Bug fix - weather not always turning off
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2018%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.12.1/module.zip)

Fixed an issue where weather FX weren't always turning off when switching to a condition without them (ex. switching from rain to clear sky).

## v1.12.0 - Custom chat text
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2018%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.12.0/module.zip)

There is now the ability to manually add any additional text you want to be displayed to chat for each weather condition (ex. system-specific penalties for movement during a blizzard).

This is the first pass at this functionality.  For now, these custom messages are unreliable when manually specifying weather.  I also plan to expand it to enable you to save/load values using external files, in order to create different sets for different systems that can easily be swapped in and out.  

## v1.11.3 - Updated French
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2015%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.11.3/module.zip)

Updates to French localization to fully support v1.11.  Thanks, Zakarik.

## v1.11.2 - Updated Swedish
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2012%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.11.2/module.zip)

Updates to Swedish localization to fully support v1.11.  Thanks, Jonas Karlsson.

## v1.11.1 - Updated German
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2012%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.11.1/module.zip)

Updates to German localization to fully support v1.11.  Thanks, SesuUisu.

## v1.11.0 - Can now store daily weather history
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2011%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.11.0/module.zip)

Can now store daily weather in Simple Calendar notes (to see history and use same weather if you revisit a date).  See readme/package description for more details.

## v1.10.2 - Bug fix - consecutive, duplicate weather using Core FX no longer turns off the effect
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2009%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.10.2/module.zip)

## v1.10.1 - Bug fix - toggle FX button now properly reflecting the toggle state
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-May%2007%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.10.1/module.zip)

## v1.10.0 - New "repost to chat" button
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-April%2027%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.10.0/module.zip)

## v1.9.3 - More bug fixes for display issues with Simple Calendar attachment
#### Support for Simple Calendar v2.4.13
![](https://img.shields.io/badge/release%20date-April%2007%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.9.3/module.zip)

## v1.9.2 - More bug fixes for display issues with Simple Calendar attachment
#### Support for Simple Calendar v2.4.3
![](https://img.shields.io/badge/release%20date-April%2007%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.9.2/module.zip)

## v1.9.1 - Bug fixes for some display issues with Simple Calendar attachment
![](https://img.shields.io/badge/release%20date-April%2007%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.9.1/module.zip)

## v1.9.0 - Added support for displaying as a pop-out window attached to Simple Calendar
![](https://img.shields.io/badge/release%20date-April%2007%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.9.0/module.zip)

## v1.8.2 - Fixed issue with scene control button not displaying
![](https://img.shields.io/badge/release%20date-March%2030%2C%202024-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.8.2/module.zip)


## v1.8.1 - Fixed "sync to calendar" setting not saving between sessions
![](https://img.shields.io/badge/release%20date-December%2026%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.8.1/module.zip)

Added button to "journal notes" menu to open the dialog after it's been closed.
## v1.8.0 - Added scene control button to reopen dialog
![](https://img.shields.io/badge/release%20date-November%2012%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.8.0/module.zip)

Added button to "journal notes" menu to open the dialog after it's been closed.

## v1.7.3 - Nothing to see here
![](https://img.shields.io/badge/release%20date-November%2012%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.7.3/module.zip)

More debugging support

## v1.7.2 - Fixed console error related to FXMaster on new scenes
![](https://img.shields.io/badge/release%20date-November%2012%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.7.2/module.zip)

Added some api code to support debugging

## v1.7.1 - Nothing to see here
![](https://img.shields.io/badge/release%20date-November%2012%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.7.1/module.zip)

Added some api code to support debugging

## v1.7.0 - Improved weather results and FX Master support
![](https://img.shields.io/badge/release%20date-November%2011%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.7.0/module.zip)

Enabled FX Master support for weather effects.  See readme/package description for more details.

Fixed cases where sometimes summer weather could get too cold or winter weather could get too hot.  Also fixed some temperate 
weather results that had temperatures that didn't make sense.

## v1.6.3 - German localization update and bug fix
![](https://img.shields.io/badge/release%20date-November%203%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.6.3/module.zip)

Fixed bug where you couldn't use keybinding to reopen a window closed with "X" button. Updates to German localization to fully support v1.6.

<hr/>

## v1.6.2 - French localization update
![](https://img.shields.io/badge/release%20date-November%203%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.6.2/module.zip)

Updates to French localization to fully support v1.6.

<hr/>

## v1.6.1 - Bug fix
![](https://img.shields.io/badge/release%20date-October%2031%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.6.1/module.zip)

Disabled ability for non-GMs to use keybindings to do things they shouldn't be allowed to do. :)

<hr/>

## v1.6.0 - Keybindings
![](https://img.shields.io/badge/release%20date-October%2031%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.6.0/module.zip)

There are now keybinding options available under 'Configure Controls'

<hr/>

## v1.5.3 - Bug fix
![](https://img.shields.io/badge/release%20date-October%2030%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.5.3/module.zip)

Pressing both mouse buttons simultaneously on header bars no longer causes the dialog to disappear.

<hr/>

## v1.5.2 - Swedish and French localization update
![](https://img.shields.io/badge/release%20date-October%2029%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.5.2/module.zip)

Updates to Swedish and French localization to fully support v1.5.

<hr/>

## v1.5.1 - German localization update
![](https://img.shields.io/badge/release%20date-October%2029%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.5.1/module.zip)

Updates to German localization to fully support v1.5.

<hr/>

## v1.5.0 - Manually select weather
![](https://img.shields.io/badge/release%20date-October%2028%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.5.0/module.zip)

Enabled ability to manually select weather when needed.

<hr/>

## v1.4.2 - Bug fix
![](https://img.shields.io/badge/release%20date-October%2028%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.4.2/module.zip)

Fixed issue where calendar would not properly refresh.

<hr/>

## v1.4.1 - Now in Hindi!  (and a bug fix)
![](https://img.shields.io/badge/release%20date-October%2028%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.4.1/module.zip)

Hindi language support

Thanks to Harshavardhan Bajoria for adding Hindi translations!

Also fixed issue introduced in 1.4.0 where the dialog would never show if Simple Calendar wasn't installed.

<hr/>

## v1.4.0 - New UI and added weather effects
![](https://img.shields.io/badge/release%20date-October%2028%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.4.0/module.zip)

Some big changes:
- Reworked UI to shrink screen real estate by letting you toggle various control bars on/off based on your needs 
- Added first cut at weather effects; you can enable in the settings.  For now, only uses core scene weather functionality, but plan to add support for more sophisticated modules.

<hr/>

## v1.3.3 - Now in French (Français)!
![](https://img.shields.io/badge/release%20date-October%2024%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.3.3/module.zip)

French language support

Thanks to Zakarik for adding French translations!

<hr/>

## v1.3.2 - Now in Swedish (Svenska)!
![](https://img.shields.io/badge/release%20date-October%2022%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.3.2/module.zip)

Swedish language support

Thanks to Jonas Karlsson for adding Swedish translations!

<hr/>

## v1.3.1 - Bug fix
![](https://img.shields.io/badge/release%20date-October%2021%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.3.1/module.zip)

Bug fix - weather box no longer blocks elements when hidden

<hr/>

## v1.3.0 - Season sync to Simple Calendar
![](https://img.shields.io/badge/release%20date-October%2021%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.3.0/module.zip)

You can now choose to sync the season with Simple Calendar; see documentation 

<hr/>

## v1.2.1 - Fix to manifest file location
![](https://img.shields.io/badge/release%20date-October%2020%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.2.1/module.zip)

Fixed bad manifest file location in module.json preventing updates 

<hr/>

## v1.2.0 - Now in German (Deutsch)!  Also, reduced screen footprint

![](https://img.shields.io/badge/release%20date-October%2020%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.2.0/module.zip)

Added an option to hide the date/time box when using Simple Calendar (it's always hidden without it).  Helpful if you like to leave Simple Calendar open so only need the weather side of Simple Weather.

Thanks to SesuUisu for adding German translations!

<hr/>

## v1.1.0 - Removed dependency on Simple Calendar

![](https://img.shields.io/badge/release%20date-October%2017%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.1.0/module.zip)

Enabled the weather generator to be used independent of Simple Calendar

<hr/>

## v1.0.0 - Initial Release

![](https://img.shields.io/badge/release%20date-October%2016%2C%202023-blue)
![GitHub release](https://img.shields.io/github/downloads-pre/dovrosenberg/foundry-simple-weather/v1.0.0/module.zip)

The initial public release.

- Intuitive UI to generate weather and see current time from Simple Calendar 
- Print the weather to chat, with the option of showing to players or not
- Choose whether players can see the dialog
- Generate weather for every new day automatically
- Randomized weather for every season across 3 climates (hot, temperate, cold) and 3 humidities (barren, modest, verdant)
- Weather progresses naturally from day to day
- Supports Fahrenheit and Celsius temperatures

As the GM you will also be able to change the current day in your game and add notes to days. Notes can be events or reminders and can be visible to players or just the GM.

The players are presented with a familiar calendar interface for switching between months and selecting days to see any notes on those days.
