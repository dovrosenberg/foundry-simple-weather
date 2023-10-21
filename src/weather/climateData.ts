import { localize } from '@/utils/game';
import { log } from '@/utils/log';

export enum Season {
  Spring,
  Summer,
  Fall,
  Winter
}

export enum Humidity {
  Barren,
  Modest,
  Verdant
}

export enum Climate {
  Cold,
  Temperate,
  Hot
}

// these are used to create the drop downs; the first value in each
//    subarray is the value, the second the description
type SelectOption = { value: string, text: string};

let biomeSelections: SelectOption[];
let climateSelections: SelectOption[];
let humiditySelections: SelectOption[];
let seasonSelections: SelectOption[];

// call to set everything up after the game has loaded
export function initializeLocalizedText(): void {
  log(false, 'Loading localized climate text');

  biomeSelections = [
    { value: '', text: '' },
    { value: 'tundra', text: localize('sweath.options.biome.tundra') },
    { value: 'alpine', text: localize('sweath.options.biome.alpine') },
    { value: 'taiga', text: localize('sweath.options.biome.taiga') },
    { value: 'chapparel', text: localize('sweath.options.biome.chapparel') },
    { value: 'grassland', text: localize('sweath.options.biome.grassland') },
    { value: 'forest', text: localize('sweath.options.biome.forest') },
    { value: 'desert', text: localize('sweath.options.biome.desert') },
    { value: 'savannah', text: localize('sweath.options.biome.savannah') },
    { value: 'rainforest', text: localize('sweath.options.biome.rainforest') },
  ];

  climateSelections= [
    { value: String(Climate.Cold), text: localize('sweath.options.climate.cold') },
    { value: String(Climate.Temperate), text: localize('sweath.options.climate.temperate') },
    { value: String(Climate.Hot), text: localize('sweath.options.climate.hot') },
  ];

  humiditySelections = [
    { value: String(Humidity.Barren), text: localize('sweath.options.humidity.barren') },
    { value: String(Humidity.Modest), text: localize('sweath.options.humidity.modest') },
    { value: String(Humidity.Verdant), text: localize('sweath.options.humidity.verdant') },
  ];

  seasonSelections = [
    { value: String(Season.Summer), text: localize('sweath.options.season.summer') },
    { value: String(Season.Fall), text: localize('sweath.options.season.fall') },
    { value: String(Season.Winter), text: localize('sweath.options.season.winter') },
    { value: String(Season.Spring), text: localize('sweath.options.season.spring') },
  ];

  // load weatherDescriptions
  // convert enums to array for safety (i.e. in case values aren't in order)
  const climateArray = Object.values(Climate);
  const humidityArray = Object.values(Humidity);

  // note each array contains first the string names and then the numeric 
  //    values
  for (let c=(climateArray.length/2); c<climateArray.length; c++) {
    const climate = climateArray[c];

    for (let h=(humidityArray.length/2); h<humidityArray.length; h++) {
      const humidity = humidityArray[h];

      for (let i=0; i<37; i++) {
        weatherDescriptions[climate][humidity][i] = localize(`sweath.description.${localizeClimates[climate]}.${localizeHumidities[humidity]}.${descriptionOrder[i]}`);
      }
    }
  }
}

export { 
  humiditySelections,
  climateSelections,
  biomeSelections,
  seasonSelections,
}

// these map the biomes to their climate/humidity
export const biomeMappings: Record<string, { climate: number, humidity: number }> = {
  tundra: { climate: Climate.Cold, humidity: Humidity.Barren },
  alpine: { climate: Climate.Cold, humidity: Humidity.Modest },
  taiga: { climate: Climate.Cold, humidity: Humidity.Verdant },
  chapparel: { climate: Climate.Temperate, humidity: Humidity.Barren },
  grassland: { climate: Climate.Temperate, humidity: Humidity.Modest },
  forest: { climate: Climate.Temperate, humidity: Humidity.Verdant },
  desert: { climate: Climate.Hot, humidity: Humidity.Barren }, 
  savannah: { climate: Climate.Hot, humidity: Humidity.Modest },
  rainforest: { climate: Climate.Hot, humidity: Humidity.Verdant },
};

// rather than specifying biomes, we take a more flexible approach (though we also define some biomes as defaults)
// this approach allows GMs to create non-earth biomes (ex. what's the weather like in the Fey realm or another plane?) and 
//    still easily use the tool

// this approach borrows from Dave's All-Purpose Weather Table from reddit u/AlliedSalad2
// https://docs.google.com/spreadsheets/d/1j0d1MtsWtJT-Q-Ncbl8DsBlf6cK51j5T13JTll5bSTE/edit#gid=0

// but it's heavilty based on this weather system (see /docs/weather.png) from reddit user iceandstorm as described in the comments to this post: 
//    https://www.reddit.com/r/rpg/comments/p0wq9n/weather_hex_flower_random_weather_generation/

// the numbered cells in the hex flower
//                    15
//                9       22		
//            4       16  		28	
//         0      10	  	23	  	33
//            5 		  17  		29	
//         1		  11  		24		  34
//            6		    18	  	30	
//         2		  12	  	25		  35
//            7		    19	  	31	
//         3		  13	  	26		  36
//            8		    20		32	
//                14	  	27		
//                    21			

// we call this direction only because when debugging the hex flower, it will be easier to think in terms of the picture
export enum Direction {
  stay = -1,   // important that this be -1 so that the arrays of movement results work properly
  N = 0, 
  NE = 1,
  SE = 2,
  S = 3, 
  SW = 4, 
  NW = 5
}

// the probabilities we move in each direction on any given turn
// indexed by season and then keyed by Direction
const moveProbabilities: Record<string, number>[] = [];
moveProbabilities[Season.Fall] = {
  [Direction.stay]: 0.200,
  [Direction.N]: 0.066,
  [Direction.NE]: 0.022,
  [Direction.SE]: 0.111,
  [Direction.S]: 0.200,
  [Direction.SW]: 0.246,
  [Direction.NW]: 0.155,
};
moveProbabilities[Season.Winter] = {
  [Direction.stay]: 0.200,
  [Direction.N]: 0.022,
  [Direction.NE]: 0.066,
  [Direction.SE]: 0.155,
  [Direction.S]: 0.246,
  [Direction.SW]: 0.200,
  [Direction.NW]: 0.111,
};
moveProbabilities[Season.Spring] = {
  [Direction.stay]: 0.200,
  [Direction.N]: 0.200,
  [Direction.NE]: 0.246,
  [Direction.SE]: 0.155,
  [Direction.S]: 0.066,
  [Direction.SW]: 0.022,
  [Direction.NW]: 0.111,
};
moveProbabilities[Season.Summer] = {
  [Direction.stay]: 0.200,
  [Direction.N]: 0.246,
  [Direction.NE]: 0.200,
  [Direction.SE]: 0.111,
  [Direction.S]: 0.022,
  [Direction.SW]: 0.066,
  [Direction.NW]: 0.155,
};

// determine the direction we will (attempt to) move
export const getDirection = (season: Season): Direction => {
  const rand = Math.random();

  // note: this relies on the specific values of the Direction enums
  for (let direction=-1, accumulator=0; direction<=5; direction++) {
    log(false, 'direction calc: rand=' + rand + ' direction=' + direction + ' accumulator=' + accumulator);
    accumulator += moveProbabilities[season][direction];

    if (rand<=accumulator) {
      return direction as Direction;
    }
  }

  // shouldn't get here, but just in case
  return moveProbabilities[season][5] as Direction;
};

// keyed by season, contains the possible cell starting points for each season
export const startingCells: number[][] = [[], [], [], []];
startingCells[Season.Summer] = [2, 6, 11, 17, 23, 28];
startingCells[Season.Fall] = [3, 7, 12, 18, 24, 29, 33];
startingCells[Season.Winter] = [8, 13, 19, 25, 30, 34];
startingCells[Season.Spring] = [3, 7, 12, 18, 24, 29, 33];

// indexed by Season, then the cell # you're starting in, and then Direction
export const nextCell: number[][][] = [[], [], [], []];

nextCell[Season.Summer] = [
  // N, NE, SE, S, SW, NW
  [ 0, 4, 5, 1, 15, 18 ],
  [ 0, 5, 6, 2, 1, 1 ],
  [ 1, 6, 7, 3, 28, 2 ],
  [ 2, 7, 3, 3, 33, 3 ],
  [ 4, 9, 10, 5, 0, 4 ],
  [ 4, 10, 11, 6, 1, 0 ],
  [ 5, 11, 12, 7, 2, 1 ],
  [ 6, 12, 7, 7, 3, 2 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 9, 15, 16, 10, 4, 9 ],
  [ 9, 16, 17, 11, 5, 4 ],
  [ 10, 17, 18, 12, 6, 5 ],
  [ 11, 18, 12, 12, 7, 6 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 15, 0, 15, 16, 9, 15 ],
  [ 15, 16, 23, 16, 10, 9 ],
  [ 17, 23, 24, 18, 11, 10 ],
  [ 17, 24, 18, 18, 12, 11 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 24, 22, 28, 23, 22, 22 ],
  [ 22, 28, 29, 24, 17, 16 ],
  [ 23, 29, 24, 24, 18, 17 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 28, 2, 33, 29, 23, 22 ],
  [ 28, 33, 29, 29, 24, 23 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 33, 3, 33, 33, 29, 28 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
];

nextCell[Season.Fall] = [
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 2, 6, 7, 3, 28, 2 ],
  [ 2, 7, 8, 3, 33, 3 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 6, 11, 12, 7, 2, 6 ],
  [ 6, 12, 13, 8, 3, 2 ],
  [ 7, 13, 8, 8, 34, 3 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 11, 17, 18, 12, 6, 11 ],
  [ 11, 18, 19, 13, 7, 6 ],
  [ 12, 19, 13, 13, 8, 7 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 17, 23, 24, 18, 11, 17 ],
  [ 17, 24, 25, 19, 12, 11 ],
  [ 18, 25, 19, 19, 13, 12 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 23, 28, 29, 24, 17, 23 ],
  [ 23, 29, 30, 25, 18, 17 ],
  [ 24, 30, 25, 25, 19, 18 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 28, 2, 33, 29, 23, 28 ],
  [ 28, 33, 34, 30, 24, 23 ],
  [ 29, 34, 30, 30, 25, 24 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 33, 3, 33, 34, 29, 28 ],
  [ 33, 8, 34, 34, 30, 29 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
];

nextCell[Season.Winter] = [
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 3, 7, 8, 3, 33, 3 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 7, 12, 13, 8, 3, 7 ],
  [ 7, 13, 14, 8, 34, 3 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 12, 18, 19, 13, 7, 12 ],
  [ 12, 19, 20, 14, 8, 7 ],
  [ 13, 20, 21, 12, 14, 8 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 18, 24, 25, 19, 12, 18 ],
  [ 18, 25, 26, 19, 13, 12 ],
  [ 20, 26, 27, 21, 14, 13 ],
  [ 20, 27, 21, 21, 36, 14 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 24, 29, 30, 25, 18, 24 ],
  [ 24, 30, 31, 26, 19, 18 ],
  [ 25, 31, 32, 27, 20, 19 ],
  [ 26, 32, 27, 27, 21, 20 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 29, 33, 34, 30, 24, 29 ],
  [ 29, 34, 35, 31, 25, 24 ],
  [ 30, 35, 36, 32, 26, 25 ],
  [ 31, 35, 36, 32, 32, 26 ],
  [ 33, 3, 33, 34, 29, 33 ],
  [ 33, 8, 34, 34, 30, 29 ],
  [ 35, 35, 35, 36, 31, 30 ],
  [ 35, 21, 18, 36, 32, 31 ],
];

nextCell[Season.Spring] = nextCell[Season.Fall];

// descriptions and temperatures are indexed by Climate, then Humidity, then cell #
// seasons are handled by controlling which parts of the grid you can get to
// we need to populate the descriptions because we might call them before localization happens
export const weatherDescriptions: string[][][] = new Array(Object.keys(Climate).length)
  .fill('')
  .map(() => new Array(Object.keys(Humidity).length)
    .fill('')
    .map(() => new Array(37).fill('')));


export const weatherTemperatures: number[][][] = [[[]], [[]], [[]], [[]]];

/////////////////////////////////////////
// these things are used to map the i18n keys to the right spot in our arrays
// maps the localized names to the hex order
const descriptionOrder = [
  'summer.1',
  'summer.5',
  'springfall.warm.1',
  'springfall.1',

  'summer.2',
  'summer.6',
  'springfall.warm.2',
  'springfall.2',
  'springfall.cool.1',

  'summer.3',
  'summer.7',
  'springfall.warm.3',
  'springfall.3',
  'springfall.cool.2',
  'winter.1',

  'summer.4',
  'summer.8',
  'springfall.warm.4',
  'springfall.4',
  'springfall.cool.3',
  'winter.2',
  'winter.6',

  'summer.9',
  'springfall.warm.5',
  'springfall.5',
  'springfall.cool.4',
  'winter.3',
  'winter.7',

  'springfall.warm.6',
  'springfall.6',
  'springfall.cool.5',
  'winter.4',
  'winter.8',

  'springfall.7',
  'springfall.cool.6',
  'winter.5',
  'winter.9',
];
const localizeClimates = {
  [Climate.Cold]: 'cold',
  [Climate.Temperate]: 'temperate',
  [Climate.Hot]: 'hot',

};
const localizeHumidities = {
  [Humidity.Barren]: 'barren',
  [Humidity.Modest]: 'modest',
  [Humidity.Verdant]: 'verdant',
};

///////////////////////////////////////

weatherTemperatures[Climate.Cold][Humidity.Barren] = [
  44, 42, 30, 23,
  51, 46, 32, 18, 11,
  60, 49, 28, 14, 9, -3,
  47, 75, 40, 32, 19, -53, -24,
  36, 49, 36, 30, -15, -35,
  32, 51, 23, 18, -9,
  36, 32, -38, 4,
];

weatherTemperatures[Climate.Cold][Humidity.Modest] = [
  44, 42, 30, 23,
  51, 46, 32, 18, 11,
  60, 49, 28, 14, 9, -3,
  47, 80, 40, 32, 19, -53, -24,
  36, 49, 36, 30, -15, -35,
  32, 51, 23, 18, -9,
  36, 32, -38, 4,
];

weatherTemperatures[Climate.Cold][Humidity.Verdant] = [
  44, 42, 30, 23,
  51, 46, 32, 18, 11,
  60, 49, 28, 14, 9, -3,
  47, 75, 40, 32, 19, -53, -24,
  36, 49, 36, 30, -15, -35,
  32, 51, 23, 18, -9,
  36, 32, -38, 4,
];

weatherTemperatures[Climate.Temperate][Humidity.Barren] = [
  79, 78, 72, 68,
  83, 80, 73, 66, 63,
  87, 81, 71, 64, 61, 55,
  73, 100, 77, 73, 66, 30, 44,
  75, 81, 75, 72, 49, 39,
  73, 83, 68, 66, 52,
  75, 73, 38, 59,
];

weatherTemperatures[Climate.Temperate][Humidity.Modest] = [
  70, 68, 57, 50,
  77, 72, 59, 45, 39,
  86, 75, 55, 41, 37, 25,
  73, 110, 66, 59, 46, -23, 5,
  63, 75, 63, 57, 14, -6,
  59, 77, 50, 45, 19,
  63, 59, -8, 32,
];

weatherTemperatures[Climate.Temperate][Humidity.Verdant] = [
  53, 51, 42, 36,
  78, 54, 43, 32, 28,
  74, 67, 41, 38, 26, 16,
  75, 85, 66, 59, 46, -23, 0,
  80, 75, 63, 57, 14, -6,
  59, 77, 50, 45, 19,
  63, 59, -10, 22,
];

weatherTemperatures[Climate.Hot][Humidity.Barren] = [
  93, 92, 87, 84,
  96, 94, 88, 82, 79,
  100, 95, 86, 80, 78, 73,
  94, 110, 91, 88, 82, 51, 66,
  90, 95, 90, 87, 67, 59,
  88, 96, 84, 82, 70,
  90, 88, 58, 76,
];

weatherTemperatures[Climate.Hot][Humidity.Modest] = [
  79, 79, 77, 75,
  80, 79, 77, 74, 73,
  82, 80, 76, 73, 73, 71,
  79, 86, 78, 77, 74, 61, 63,
  78, 80, 78, 76, 68, 65,
  77, 80, 75, 74, 69,
  78, 77, 64, 72,
];

weatherTemperatures[Climate.Hot][Humidity.Verdant] = [
  85, 84, 83, 82,
  86, 85, 83, 81, 80,
  87, 85, 82, 80, 80, 78,
  85, 91, 84, 83, 81, 70, 75,
  84, 85, 84, 83, 76, 73,
  83, 86, 82, 81, 77,
  83, 83, 73, 79,
];