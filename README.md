# Simple Weather

[![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/dovrosenberg/foundry-simple-weather/raw/master/static/module.json)](https://github.com/dovrosenberg/foundry-simple-weather)

A module that provides dynamic weather generation, by season and biome.  If [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) (minimum version 2.4.0) is present, Simple Weather will integrate to it and display the date/time and automatically generate new weather when the date changes.  Without Simple Calendar, no date is shown and weather regeneration can be manually triggered. (NOTE: THIS MODULE IS NOT AFFILIATED WITH THE CREATORS OF SIMPLE CALENDAR)

An alternative to [Weather Control](https://foundryvtt.com/packages/weather-control) with an updated algorithm (or for those not wishing to rely on Simple Calendar), **Simple Weather** aims to provide the most seamless experience to add dynamic weather to your game based on climates.

I built this as a way to learn Foundry better, but I plan to maintain it for now and am happy to consider feature requests (open an issue at (https://github.com/dovrosenberg/foundry-simple-weather/issues))

## Features

- Intuitive UI to generate weather  
- Print the weather to chat, with the option of showing to players or not
- Choose whether players can see the dialog
- Randomized weather for every season across 3 climates (hot, temperate, cold) and 3 humidities (barren, modest, verdant)
- Weather progresses naturally from day to day
- Supports Farenheit and Celsius temperatures

### And if using Simple Calendar:
- Generate weather for every new day automatically
- Use the Simple Calendar season to adjust season automatically
- Show the current date/time from Simple Calendar in a smaller box (good for players who don't need the full Simple Calendar display), or hide it and just show the weather

## Controls

![Main UI](https://i.imgur.com/Cv2PLVS.png)

### Biomes/Climate/Humidity ###

Selecting a biome will automatically pick the climate and humidity to match - providing an easy way to pick standard Earth biomes.  But you can also
pick the climate/humidity separately so it's flexible to capture most weather conditions.

### Seasons ###
Seasons determine the types of weather for each biome.  Winter is colder, summer is hotter, and spring/fall are in the middle (but generally tend toward getting warmer/colder).

When not using Simple Calendar, you just select the season you want to use.  

When using Simple Calendar, you can choose "Sync with Simple Calendar" and the season of the current date will be used automatically.  The season icon next to the drop down will change to let you know what season it is currently using.  Simple Weather determines the Season to use based on the icon for the season in Simple Calendar.  So, if you are using a custom calendar, for season sync to work you must a) set up seasons in Simple Calendar, and b) choose one of the season icons (fall, winter, spring, summer) for each of your seasons.

In some cases, you may need to override Simple Calendar's season. In particular, if you change hemispheres - because what Simple Calendar thinks is summer (ex. July) may actually be cold temperatures (ex. if in South America), so you'll want to manually override it.  "Winter" is always cold in Simple Weather.  In that case, simply pick the season you want in the drop down.  It will remain in the manual setting until you set it back to "Sync".

## Support

If you believe you found a bug or would like to post a feature request, head over to the module's [Github repo](https://github.com/dovrosenberg/foundry-simple-weather) and [open a new issue](https://github.com/dovrosenberg/foundry-simple-weather/issues/new).


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
