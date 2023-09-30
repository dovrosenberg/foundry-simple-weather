import { Log } from '@/logger/logger';
import { mockClass } from '@/utils/testUtils';

import { Migrations } from './migrations';
import { Migration1 } from './migrations/migration-1';

const STARTING_DATE = {
  year: 816,
  month: 4,
  day: 18,
  dayOfTheWeek: 4,
  hour: 15,
  minute: 56,
  second: 45,
  weekdays: [
    'Miresen',
    'Grissen',
    'Whelsen',
    'Conthsen',
    'Folsen',
    'Yulisen',
    'Da\'leysen'
  ],
  display: {
    date: 'Unndilar 19, 816',
    time: '15:56:45'
  }
};

const EXPECTED_CURRENT_DATE = {
  raw: {
    year: STARTING_DATE.year,
    month: STARTING_DATE.month,
    weekdays: STARTING_DATE.weekdays,
    currentWeekdayIndex: STARTING_DATE.dayOfTheWeek,
    day: STARTING_DATE.day,
    hour: STARTING_DATE.hour,
    minute: STARTING_DATE.minute,
    second: STARTING_DATE.second,
  },
  display: {
    fullDate: STARTING_DATE.display.date,
    time: STARTING_DATE.display.time,
  }
};

const EXPECTED_CLIMATE = 'some-climate';
const EXPECTED_VOLCANIC = 'some-volcanic-state';
const EXPECTED_LAST_TEMP = 'some-last-temp';
const EXPECTED_PRECIPITATION = 'some-precipitation';
const EXPECTED_TEMP = 'some-temperature';
const EXPECTED_TEMP_RANGE = { min: 1, max: 2 };

const STARTING_DATA = {
  version: 1,
  dateTime: { date: STARTING_DATE },
  cTemp: 0,
  climate: EXPECTED_CLIMATE,
  isVolcanic: EXPECTED_VOLCANIC,
  lastTemp: EXPECTED_LAST_TEMP,
  precipitation: EXPECTED_PRECIPITATION,
  temp: EXPECTED_TEMP,
  tempRange: EXPECTED_TEMP_RANGE,
};

const EXPECTED_DATA = {
  version: 1,
  currentDate: EXPECTED_CURRENT_DATE,
  climate: EXPECTED_CLIMATE,
  isVolcanic: EXPECTED_VOLCANIC,
  lastTemp: EXPECTED_LAST_TEMP,
  precipitation: EXPECTED_PRECIPITATION,
  temp: EXPECTED_TEMP,
  tempRange: EXPECTED_TEMP_RANGE,
};


describe('Migrations End-to-End', () => {

  it('SHOULD run all migrations from 0 to the latest', () => {
    const migrations = new Migrations(mockClass(Log));
    const migration1 = new Migration1();
    migrations.register(migration1);

    const result = migrations.run(0, STARTING_DATA);

    expect(result).toEqual(EXPECTED_DATA);
  });
});
