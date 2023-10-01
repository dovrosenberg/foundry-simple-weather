// import { WeatherApplication } from './applications/weatherApplication';
// import { Log } from './logger/logger';
// import { Climate } from './models/climate';
// import { WeatherData } from './models/weatherData';
// import { ChatProxy } from './proxies/chatProxy';
// import { ModuleSettings } from './settings/module-settings';
// import { gameMock, mockClass } from './utils/testUtils';
// import { Weather } from './weather';
// import { WeatherTracker } from './weather/weatherTracker';

// const WEATHER_DATA: WeatherData = new WeatherData({
//   version: 1,
//   currentDate: {
//     day: 1,
//     dayOfTheWeek: 1,
//     hour: 0,
//     minute: 0,
//     month: 0,
//     second: 0,
//     weekdays: [],
//     year: 0,
//     date: 'the full date',
//     time: 'the full time',
//   },
//   climate: new Climate(),
//   isVolcanic: false,
//   lastTemp: 50,
//   precipitation: null,
//   temp: 50,
//   tempRange: { min: 30, max: 90 },
// });

// const fakeDateObject = {
//   display: {
//     month: 1
//   }
// };

// describe('Weather', () => {
//   let weather: Weather;
//   let log;
//   let game;
//   let chatProxy;
//   let moduleSettings;

//   beforeAll(() => {
//     window.SimpleCalendar = {
//       api: {
//         timestamp: jest.fn(),
//         timestampToDate: jest.fn().mockReturnValue(fakeDateObject),
//       }
//     };
//   });

//   beforeEach(() => {
//     game = gameMock();
//     log = mockClass(Log);
//     chatProxy = mockClass(ChatProxy);
//     moduleSettings = mockClass(ModuleSettings);
//     moduleSettings.getWeatherData = jest.fn().mockReturnValue({ version: 999 });
//     moduleSettings.setWeatherData = jest.fn().mockReturnValue(new Promise<void>(resolve => resolve()));
//     weather = new Weather(game, chatProxy, log, moduleSettings);
//     getWeatherTracker().setWeatherData(WEATHER_DATA);
//   });

//   it('SHOULD call the weatherTracker when weather need to be generated', () => {
//     game.user = { isGM: true };
//     givenAWeatherApplicationMock();
//     givenModuleSettingsWithDateTime();
//     const weatherTracker = getWeatherTracker();
//     weatherTracker.generate = jest.fn().mockReturnValue(WEATHER_DATA);

//     weather.onDateTimeChange(givenADifferentDateTime());

//     expect(weatherTracker.generate).toHaveBeenCalled();
//   });

//   it('SHOULD NOT call weatherTracker when the date does not change', () => {
//     game.user = { isGM: true };
//     givenAWeatherApplicationMock();
//     givenModuleSettingsWithDateTime();
//     const weatherTracker = getWeatherTracker();
//     weatherTracker.generate = jest.fn();

//     weather.onDateTimeChange(givenADifferentTime());

//     expect(weatherTracker.generate).not.toHaveBeenCalled();
//   });

//   it('SHOULD NOT call weatherTracker when the new date object is partially undefined', () => {
//     game.user = { isGM: true };
//     givenAWeatherApplicationMock();
//     givenModuleSettingsWithDateTime();
//     const weatherTracker = getWeatherTracker();
//     weatherTracker.generate = jest.fn();
//     const invalidDateObject = givenADifferentDateTime();
//     delete invalidDateObject.raw.day;

//     weather.onDateTimeChange(invalidDateObject);

//     expect(weatherTracker.generate).not.toHaveBeenCalled();
//   });

//   it('SHOULD call weatherTracker when the previous date object is partially undefined', () => {
//     game.user = { isGM: true };
//     givenAWeatherApplicationMock();
//     const invalidDateObject = givenACurrentDate();
//     delete invalidDateObject.raw.day;
//     givenModuleSettingsWithDateTime();
//     const weatherTracker = getWeatherTracker();
//     weatherTracker.generate = jest.fn().mockReturnValue(WEATHER_DATA);

//     weather.onDateTimeChange(givenADifferentDateTime());

//     expect(weatherTracker.generate).toHaveBeenCalled();
//   });

//   it('SHOULD NOT call generate new weather multiple times when onDateTimeChange is called multiple times', () => {
//     game.user = { isGM: true };
//     givenAWeatherApplicationMock();
//     givenModuleSettingsWithDateTime();
//     const weatherTracker = getWeatherTracker();
//     const newDateTime = givenADifferentDateTime();
//     weatherTracker.generate = jest.fn().mockReturnValue({currentDate: newDateTime});

//     for (let i = 0; i < 3; ++i) {
//       weather.onDateTimeChange(newDateTime);
//     }

//     expect(weatherTracker.generate).toBeCalledTimes(1);
//   });

//   describe('weather application', () => {
//     it('SHOULD be instantiated if the user is the GM', async() => {
//       givenModuleSettingsWithDateTime();
//       game.user = { isGM: true };

//       return weather.onReady().then(() => {
//         expect(getWeatherApplication()).toBeDefined();
//       });
//     });

//     it('SHOULD be instantiated if the setting is turned on AND the user is not a GM', async() => {
//       const settings = givenModuleSettingsWithDateTime();
//       settings.getCalendarDisplay = jest.fn().mockReturnValue(true);
//       game.user = { isGM: false };

//       return weather.onReady().then(() => {
//         expect(getWeatherApplication()).toBeDefined();
//       });

//     });

//     it('SHOULD NOT be instantiated if the setting is turned off and the user is a player', async() => {
//       const settings = givenModuleSettingsWithDateTime();
//       settings.getCalendarDisplay = jest.fn().mockReturnValue(false);
//       game.user = { isGM: false };

//       return weather.onReady().then(() => {
//         expect(getWeatherApplication()).toBeUndefined();
//       });
//     });
//   });

//   describe('onClockStartStop', () => {
//     it('SHOULD call weather application WHEN user is a GM', () => {
//       game.user = { isGM: true };
//       weather = new Weather(game, chatProxy, log, moduleSettings);
//       const weatherApplication = givenAWeatherApplicationMock();

//       weather.onClockStartStop();

//       expect(weatherApplication.updateClockStatus).toHaveBeenCalled();
//     });

//     it('SHOULD call weather application WHEN user is allowed to see the window', () => {
//       game.user = { isGM: false };
//       weather = new Weather(game, chatProxy, log, moduleSettings);
//       givenCalendarDisplaySetting(true);
//       const weatherApplication = givenAWeatherApplicationMock();

//       weather.onClockStartStop();

//       expect(weatherApplication.updateClockStatus).toHaveBeenCalled();
//     });

//     it('SHOULD NOT call weather application WHEN user is not allowed to see the window', () => {
//       game.user = { isGM: false };
//       weather = new Weather(game, chatProxy, log, moduleSettings);
//       givenCalendarDisplaySetting(false);
//       const weatherApplication = givenAWeatherApplicationMock();

//       weather.onClockStartStop();

//       expect(weatherApplication.updateClockStatus).not.toHaveBeenCalled();
//     });
//   });

//   function getModuleSettings(): ModuleSettings {
//     return weather['settings'];
//   }

//   function givenModuleSettingsWithDateTime(): ModuleSettings {
//     const settings = givenMockedWeatherData({ currentDate: givenACurrentDate() });
//     return settings;
//   }

//   function givenMockedWeatherData(weatherData: Partial<WeatherData>): ModuleSettings {
//     const settings = getModuleSettings();
//     settings.getWeatherData = jest.fn().mockReturnValue({
//       version: 999,
//       ...weatherData
//     });

//     return settings;
//   }

//   function givenCalendarDisplaySetting(allowed: boolean) {
//     const settings = getModuleSettings();
//     settings.getCalendarDisplay = jest.fn().mockReturnValue(allowed);
//   }

//   function getWeatherTracker(): WeatherTracker {
//     return weather['weatherTracker'];
//   }

//   function givenAWeatherApplicationMock() {
//     weather['weatherApplication'] = mockClass(WeatherApplication);
//     return getWeatherApplication();
//   }

//   function getWeatherApplication(): WeatherApplication {
//     return weather['weatherApplication'];
//   }

//   function givenACurrentDate(): SimpleCalendar.DateData {
//     const dateTime = new SimpleCalendar.DateData();
//     dateTime.day = 1;
//     dateTime.month = 2;
//     dateTime.year = 3;
//     dateTime.second = 4;
//     dateTime.minute = 5;
//     dateTime.hour = 6;

//     return dateTime;
//   }

//   function givenADifferentTime(): SimpleCalendar.DateData {
//     const dateTime = givenACurrentDate();
//     dateTime.second = 22;
//     dateTime.minute = 23;
//     dateTime.hour = 24;

//     return dateTime;
//   }

//   function givenADifferentDateTime(): SimpleCalendar.DateData {
//     const dateTime = new SimpleCalendar.DateData();
//     dateTime.day = 11;
//     dateTime.month = 12;
//     dateTime.year = 13;
//     dateTime.second = 14;
//     dateTime.minute = 15;
//     dateTime.hour = 16;

//     return dateTime;
//   }
// });
