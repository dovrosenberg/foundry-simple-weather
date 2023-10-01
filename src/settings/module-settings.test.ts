// import { gameMock } from '../utils/testUtils';
// import { ModuleSettings, SettingKeys } from './module-settings';

// const fakeDateObject = {
//   display: {
//     month: 1
//   }
// };

// describe('Settings', () => {
//   let game;
//   let settings: ModuleSettings;

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
//     settings = new ModuleSettings(game);
//   });

//   it('SHOULD register all required settings', () => {
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.calendarDisplay, expect.any(Object));
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.noticeVersion, expect.any(Object));
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.outputWeatherToChat, expect.any(Object));
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.playerSeeWeatherInfo, expect.any(Object));
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.useCelcius, expect.any(Object));
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.weatherData, expect.any(Object));
//     expect(game.settings.register).toHaveBeenCalledWith(settings.getModuleName(), SettingKeys.windowPosition, expect.any(Object));
//   });
// });
