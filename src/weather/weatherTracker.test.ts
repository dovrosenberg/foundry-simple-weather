import { Climate } from '@/models/climate';

import { WeatherData } from '../models/weatherData';
import { ChatProxy } from '../proxies/chatProxy';
import { ModuleSettings } from '../settings/module-settings';
import { gameMock, mockClass } from '../utils/testUtils';
import { WeatherTracker } from './weatherTracker';

const game = gameMock();

const WEATHER_DATA: WeatherData = new WeatherData({
  version: 1,
  currentDate: {
    raw: {
      day: 1,
      currentWeekdayIndex: 1,
      hour: 0,
      minute: 0,
      month: 0,
      second: 0,
      weekdays: [],
      year: 0,
    },
    display: {
      fullDate: 'the full date',
      time: 'the full time',
    }
  },
  climate: new Climate(),
  isVolcanic: false,
  lastTemp: 50,
  precipitation: null,
  temp: 50,
  tempRange: { min: 30, max: 90 },
});

describe('WeatherTracker', () => {
  let weatherTracker: WeatherTracker;
  let settings;
  let chatProxy;

  beforeEach(() => {
    settings = mockClass(ModuleSettings);
    chatProxy = mockClass(ChatProxy);
    weatherTracker = new WeatherTracker(game, chatProxy, settings);
  });

  it('SHOULD exist', () => {
    expect(weatherTracker).toBeTruthy();
  });

  it('SHOULD output to chat when the setting is enabled', () => {
    (chatProxy.getWhisperRecipients as jest.Mock).mockReturnValue([{_id: '0'}]);
    weatherTracker.setWeatherData(WEATHER_DATA);
    settings.getOutputWeatherToChat.mockReturnValue(true);

    weatherTracker.generate();

    expect(chatProxy.create).toHaveBeenCalled();
  });

  it('SHOULD save weather data after generating', () => {
    weatherTracker.setWeatherData(WEATHER_DATA);
    weatherTracker.generate();
    expect(settings.setWeatherData).toHaveBeenCalled();
  });
});
