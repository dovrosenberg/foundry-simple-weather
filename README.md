[![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/dovrosenberg/foundry-simple-weather/raw/master/static/module.json)](https://github.com/dovrosenberg/foundry-simple-weather)

Dynamic weather generation, by season and biome, including automatically activating weather effects.  If [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) (see changelog for which versions of SC are supported by each version of Simple Weather) is present, Simple Weather will integrate to it and display the date/time and automatically generate new weather when the date changes.  Without Simple Calendar, no date is shown and weather regeneration can be manually triggered. (NOTE: THIS MODULE IS NOT AFFILIATED WITH THE CREATORS OF SIMPLE CALENDAR)


I built this as a way to learn Foundry better, but I plan to maintain it for now and am happy to consider [feature requests](https://github.com/dovrosenberg/foundry-simple-weather/issues/new/choose)

## Features

- Intuitive UI to generate weather  
- Use Foundry scene weather or FX Master to automatically show rain, snow, etc. when appropriate
- Various ways to share weather with players
  - Print the weather to chat, with the option of showing to players or not
  - Choose whether players can see the dialog (with a limited UI)
- Randomized weather for every season across 3 climates (hot, temperate, cold) and 3 humidities (barren, modest, verdant)
- Weather progresses naturally from day to day
- Ability to manually pick weather for special events
- Ability to store weather history to calendar day, enabling replaying weather history
- Ability to add custom text (ex. movement penalties during snowstorms) to each weather condition
- Supports Farenheit and Celsius temperatures
- Helpful keybinding options

### And if using Simple Calendar:
- Generate weather for every new day automatically
- Use the Simple Calendar season to adjust season automatically
- Show the current date/time from Simple Calendar in a smaller box (good for players who don't need the full Simple Calendar display), or hide it and just show the weather
- Display either as a standalone window or as a slide-out window attached to Simple Calendar

## Controls

### Gamemaster controls

![Main UI](https://i.imgur.com/cqVRWgQ.png)

### Player controls

![Main UI](https://i.imgur.com/8tmHSFu.png)

### Hide/diplay dialog
You can set a keybinding (see below) to toggle the window on/off.  You can also hide the whole thing using the 'x' on the weather box.  Once hidden, if you don't have a keybinding set, you can also re-open it via the Simple Weather button under the journal notes scene control menu.

### Biomes/Climate/Humidity 

Selecting a biome will automatically pick the climate and humidity to match - providing an easy way to pick standard Earth biomes.  But you can also
pick the climate/humidity separately so it's flexible to capture most weather conditions.

### Seasons 
Seasons determine the types of weather for each biome.  Winter is colder, summer is hotter, and spring/fall are in the middle (but generally tend toward getting warmer/colder).

When not using Simple Calendar, you just select the season you want to use.  

When using Simple Calendar, you can choose "Sync with Simple Calendar" and the season of the current date will be used automatically.  The season icon next to the drop down will change to let you know what season it is currently using.  Simple Weather determines the Season to use based on the icon for the season in Simple Calendar.  So, if you are using a custom calendar, for season sync to work you must a) set up seasons in Simple Calendar, and b) choose one of the season icons (fall, winter, spring, summer) for each of your seasons.

In some cases, you may need to override Simple Calendar's season. In particular, if you change hemispheres - because what Simple Calendar thinks is summer (ex. July) may actually be cold temperatures (ex. if in South America), so you'll want to manually override it.  "Winter" is always cold in Simple Weather.  In that case, simply pick the season you want in the drop down.  It will remain in the manual setting until you set it back to "Sync".

### Manual weather
Sometimes you might want to specify the exact weather that you need, rather than having it randomly generated (for example when approaching the lair of a frost witch).  To do this, open the manual toolbar and check "Pause updates" (which will collapse the season and biome toolbars for simplicity).  Note that pausing isn't technically required, but if you don't then if you hit "regenerate" or advance the date, the weather will go back to the normal weather pattern.  You can then choose the weather desired from the dropdown and enter a temperature before hitting the submit button.  This will then cause the weather to appear in the chat, player dialogs, and weather effects just as if the system generated it (as determined by your settings).  

Unchecking "Pause updates" won't immediately trigger a regeneration of weather, but if you want one without advancing the date, just then hit the "regenerate" button.

### Weather Effects 
The GM can activate weather effects in the module settings.  This includes support for the scene weather in the Foundry core, as well as FX Master.  Weather is not scene specific.

Once activated in settings, the scene weather will automatically be changed whenever the weather warrants it.  There is currently only support for inclement weather (rain, hail, snow, fog).  Let me know if there's any desire to do something to show sunny days, as I wasn't sure what made the most sense.

When players go inside, you can easily toggle the fx on/off temporarily using the toggle button on the toolbar.

***Note: When using FXMaster, effects can take up to 20 seconds to fully transition when changing (or enabling/disabling with the toolbar).  In particular, clouds and fog take a long time to get going and stop.  This is a result of the way FX Master's API works.  Feel free to chime in on [this](https://github.com/ghost-fvtt/fxmaster/issues/635) issue to encourage them to add support for just turning things off immediately (though I'm not sure if it's still maintained).  Sometimes the new weather never shows up at all (again, clouds and fog) -- this might be a bug or it might be a bug in FX Master.  In all of these cases, refreshing the browser will immediately show the correct weather (each player needs to refresh, unfortunately).*** 

***Note 2: I've mixed up the weather effects a bit - in particular whether or not clouds show up when it's raining.  In all cases, I'd love to hear if there are setups you'd like to change how they work.  I suspect different types of gameplay will have issues with different FX.  Simply open an issue.  At the very least, I need the text description of the weather at issue.  Preferably, the biome, climate and/or humidity as well.  Whatever you have. A description of the type of scene would be helpful, too (battle map, theater of the mind image, etc.) ***

### Keybindings
There are keybinding options under "Configure Controls" in the main Foundry Game Settings section.  You can toggle the whole window on/off, regenerate weather, pause automatic changes to the weather, and toggle weather effects on/off.  Note that these keybindings work even when the window is hidden.  So you can in theory run the whole weather system while the window is hidden (autogenerating weather by calendar, manually generating new weather, turning effects on/off).

### Simple Calendar "Attached Mode"
When using the "Attached to Simple Calendar" setting, there will be a button added to the Simple Calendar window to toggle the weather tab on/off.  In this mode, there is no option to show Simple Weather's calendar panel (because the Simple Calendar must be showing).

**Note that there is tight version dependency between this module and Simple Calendar.  Check the changelog to find the version that works for your version of Simple Calendar.  If the latest version of Simple Calendar isn't yet supported, please file an issue to let me know.**

![Main UI](https://i.imgur.com/bvX7UP1.png)

Or in compact mode:
![Main UI](https://imgur.com/RL0Oj1y.png)

## Module Options
* **Custom weather messages** - Allows you to manually enter additional text for each weather condition.  When that condition comes up, this additional text will be output to the chat after the weather description and temperature.  This is particularly useful if you'd like to assign system-specific conditions (for example, applying movement penalties during a snowstorm).  Note that you have to set it in every combination of climate, humidity, and weather that you wish to have a special notation (though anything you don't need to notate can be left blank).
* **Output weather to chat** - If checked, whenever new weather is loaded/generated, it will be displayed in the chat. If not, you can only see the weather in the dialog.
* **Make chat public** - If checked, everyone will see the weather display (from prior option) in the chat. If not, it will only be visible to the GM
* **Can players see dialog** - If checked, the player version of the dialog (see above) will be visible to players. If not, players won't see a dialog.
* **Display special effects** - Choose weather to use special effects (and which system).
* **Attach to Simple Calendar** - If checked, turns on "Attached Mode" (see above).
* **Store weather in Simple Calendar** - If checked, whenever new weather is loaded/generated, it will create a note on the current day in Simple Calendar.  This note will contain the weather for the day, for future reference.  If you ever change the calendar date to be a day that has one of these weather notes, it will reuse the weather from that date rather than generating new weather.  You can still manually set the weather or use the "regenerate" button to create new random weather (which will then update the note). The weather details are stored internally on the note, so it is safe to edit the note title and contents, if you'd like.
* **Use Celsius** - If checked, all temperatures will display in celsius.  If not, Faherenheit.

## Known Issues
### Missing box (in non-attached mode)
Some people occasionally have issues where the box will disappear and won't come back.  We haven't been able to consistently reproduce it, and I suspect it's a conflict with another module somehow.  If this happens to you, though, for now the workaround is to open your browser console (usually f12) and run this command to reset the window position: 

`game.settings.set('simple-weather', 'windowPosition', { bottom: 100, left: 100})`

Then refresh (F5).  That should make the window reappear.  If that doesn't work (or if anyone can find a way to reproduce this consistently) please create an issue report.  

### Simple Calendar attachment (compact mode)
The attachment to the calendar when the calendar is in compact mode is highly dependent on the Simple Calendar version.  It has only been fully tested with Simple Calendar v2.4.3.  You can let me know if you have trouble with a different version, but I'm not inclined to support older versions of SC.  

### Missing box (when attached to non-compact Simple Calendar)
Sometimes when you have another Simple Calendar side tab open and you try to switch to the weather tab, it will close the other tab but not show the weather.  The workaround is just to hit the weather button again.

## Problems?

If you believe you found a bug or would like to post a feature request, head over to the module's [Github repo](https://github.com/dovrosenberg/foundry-simple-weather) and [open a new issue](https://github.com/dovrosenberg/foundry-simple-weather/issues/new/choose).

## Support

I'm happy to do this for free, as I primarily work on things I like to use myself.  But if you'd like to [buy me a root beer](https://ko-fi.com/phloro), I love knowing that people are using my projects and like them enough to make the effort. It's really appreciated!  


## Credits

Simnple Weather is the result of the effort of many people (whether they know it or not). Please refer to [CREDITS.md](https://github.com/dovrosenberg/foundry-simple-weather/blob/master/CREDITS.md) for the full list.

## Copyright and usage
THIS ENTIRE REPOSITORY IS COVERED BY THIS LICENSE AND COPYRIGHT NOTICE

Copyright 2023 Dov Rosenberg

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
