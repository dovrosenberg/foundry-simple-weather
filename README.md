# Simple Weather

[![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/dovrosenberg/foundry-simple-weather/raw/master/static/module.json)](https://github.com/dovrosenberg/foundry-simple-weather)

A module that provides dynamic weather generation, by season and biome.  If [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) (minimum version 2.4.0) is present, Simple Weather will integrate to it and display the date/time and automatically generate new weather when the date changes.  Without Simple Calendar, Simple Weather displays just a weather control.  (NOTE: THIS MODULE IS NOT AFFILIATED WITH THE CREATORS OF SIMPLE CALENDAR)

An alternative to Weather Control with an updated and simplified algorithm (or for those not caring about the calendar), aims to provide the most seamless experience to add dynamic weather to your game based on climates.

I built this as a way to learn Foundry better, but I plan to maintain it for now and am happy to consider feature requests (open an issue at (https://github.com/dovrosenberg/foundry-simple-weather/issues))

## Features

- Intuitive UI to generate weather and see current time (if using Simple Calendar) 
- Print the weather to chat, with the option of showing to players or not
- Choose whether players can see the dialog
- Generate weather for every new day automatically
- Randomized weather for every season across 3 climates (hot, temperate, cold) and 3 humidities (barren, modest, verdant)
- Weather progresses naturally from day to day
- Supports Farenheit and Celsius temperatures

## Controls

![Main UI](https://i.imgur.com/CEO2rse.png)

Selecting a biome will automatically pick the climate and humidity to match - providing an easy way to pick standard Earth biomes.  But you can also
pick the climate/humidity separately so it's flexible to capture most weather conditions.

Note that the **season** does not sync with Simple Calendar.  My reasoning was that a) it would then require the GM to go through the process of mapping 
Simple Calendar seasons to "normal" ones, and more importantly b) weather patterns are opposite in the northern and southern hemisphere, so just
knowing the calendar season isn't enough to know whether it should be hot or cold.  Plus, presumably season doesn't change very often during a 
game, so it's just as easy to manually pick it.

If you disagree, open an issue and let me know.

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
