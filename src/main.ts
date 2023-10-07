import '@/../styles/simple-weather.scss';

import { ModuleSettings } from '@/settings/module-settings';
import { VersionUtils } from '@/utils/versionUtils';
import { getGame } from '@/utils/game';
import { log } from './utils/log';
import { WeatherApplication } from '@/applications/WeatherApplication';
import { generate } from '@/weather/weatherGenerator';
import { isClientGM } from '@/utils/game';

let moduleSettings: ModuleSettings;
let weatherApplication: WeatherApplication;

/**
* Register module in Developer Mode module (https://github.com/League-of-Foundry-Developers/foundryvtt-devMode)
* No need to spam the console more than it already is, we hide them between a flag.
*/

// note: for the logs to actually work, you have to activate it in the UI under the config for the developer mode module
Hooks.once('devModeReady', ({ registerPackageDebugFlag: registerPackageDebugFlag }: DevModeApi) => {
  registerPackageDebugFlag('simple-weather', 'boolean', { default: true });
});

Hooks.once('ready', () => {
//   checkDependencies();
  log(false, 'ready');
});

Hooks.once('simple-calendar-ready', () => {
  log(false, 'simple-calendar-ready');

  moduleSettings = new ModuleSettings();

  Hooks.on(SimpleCalendar.Hooks.DateTimeChange, ({date}: { date: SimpleCalendar.DateData }) => {
    //onDateTimeChange(date);
  });

  //onReady();
});

// function checkDependencies() {
//   if (!isSimpleCalendarCompatible()) {
//     const errorMessage = 'Simple Weather cannot initialize and requires Simple Calendar v2.4.0. Make sure the latest version of Simple Calendar is installed.';
//     ui.notifications?.error(errorMessage);
//   }
// }

// function isSimpleCalendarCompatible(): boolean {
//   const minimumVersion = '2.4.0';
//   const scVersion = getGame().modules.get('foundryvtt-simple-calendar')?.version;
//   return VersionUtils.isMoreRecent(scVersion, minimumVersion) || scVersion === minimumVersion;
// }


// const onReady = async function(): Promise<void> {
//   //await this.initializeWeatherData();
//   //initializeWeatherApplication();
// }

// const onDateTimeChange = function(currentDate: SimpleCalendar.DateData) {
//   //let newWeatherData = this.mergePreviousDateTimeWithNewOne(currentDate);

//   if (hasDateChanged(currentDate)) {
//     log(false, 'DateTime has changed');

//     if (isClientGM()) {
//       log(false, 'Generate new weather');
//       //newWeatherData = this.weatherGenerator.generate();

//       // save the weather we just generated
//       //moduleSettings.setLastWeatherData(newWeatherData);
//     }
//   }

//   if (isClientGM()) {
//     //this.weatherGenerator.setWeatherData(newWeatherData);
//   }

//   if (isWeatherApplicationAvailable()) {
//     log(false, 'Update weather display');
//     //this.updateWeatherDisplay(currentDate);
//   }
// }

// // const resetWindowPosition = function() {
// //   if (this.isWeatherApplicationAvailable()) {
// //     this.weatherApplication.resetPosition();
// //   }
// // }

// // do we have a dialog (either because GM or because setting says so)
// const isWeatherApplicationAvailable = function(): boolean {
//   return moduleSettings.getDialogDisplay() || isClientGM();
// }

// // const initializeWeatherData = async function() {
// //   //let weatherData = this.settings.getWeatherData();

// //   // if (this.isWeatherDataValid(weatherData)) {
// //   //   log(false, 'Using saved weather data', weatherData);
// //   //   this.weatherTracker.setWeatherData(weatherData);
// //   // } else if (isClientGM()) {
// //   //   log(false, 'No saved weather data - Generating weather');

// //   //   // NOTE: This is where you'll need to start mid-season, for example
// //   //   // more generally... if we saved the prior day, we should generate weather based on that day 
// //   //   // otherwise, we should generate weather starting at a random spot based on the season
// //   //   weatherData.currentDate = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
// //   //   this.weatherTracker.setWeatherData(weatherData);
// //   //   weatherData = this.weatherTracker.generate(Climates.temperate);
// //   //   await this.settings.setWeatherData(weatherData);
// //   // }
// // }

// const initializeWeatherApplication = function() {
//   if (isWeatherApplicationAvailable()) {
//     weatherApplication = new WeatherApplication(
//       moduleSettings,
//       () => {
//         // this will be called when the application is done with the initial render
//         log(false, 'RENDER COMPLETE!');
//         // const weatherData = this.settings.getWeatherData();
//         // weatherData.currentDate = SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
//         // this.weatherApplication.updateDateTime(weatherData.currentDate);
//         // this.weatherApplication.updateWeather(weatherData);
//       });
//   }
// };

// const hasDateChanged = function(currentDate: SimpleCalendar.DateData): boolean {
//   const previous = moduleSettings.getLastWeatherData();

//   if (isDateTimeValid(currentDate)) {
//     if (!previous || !previous.date || !isDateTimeValid(previous.date))
//       return true;

//     if (currentDate.day !== previous.date.day
//       || currentDate.month !== previous.date.month
//       || currentDate.year !== previous.date.year) {
//       return true;
//     }
//   }

//   return false;
// };

// const isDateTimeValid = function(date: SimpleCalendar.DateData): boolean {
//   if (date.second && date.minute && date.day && date.month && date.year) 
//     return true;
//   else
//     return false;
// };

// const updateWeatherDisplay = function(dateTime: SimpleCalendar.DateData) {
//   // this.weatherApplication.updateDateTime(dateTime);
//   // this.weatherApplication.updateWeather(this.weatherGenerator.getWeatherData());
// }

