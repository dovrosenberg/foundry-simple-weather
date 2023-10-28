import { localize } from '@/utils/game';
import { log } from '@/utils/log';
import { Climate, Humidity, Season } from './climateData';

let manualSelections: SelectOptions[];

// call to set everything up after the game has loaded
function initializeLocalizedText(): void {
  log(false, 'Loading localized weather text');

  // these are used to map the localized text string to the right spot in the array
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

  // build list of manual weather options; for simplicity, we steal them from ones that already exist
  const manualLookups = [
    { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1 },   // clear sky
    { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4},   // clouds
    { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6},   // overcast
    { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5},,   // dark sky
    { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7 },   // light rain
    { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6 },   // moderate rain
    { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7 },   // heavy rain
    { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2 },   // light fog
    { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3 },   // moderate fog
    { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2},   // heavy fog
    { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5 },   // light snow
    { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9 },   // moderate snow
    { climate: Climate.Cold , humidity: Humidity.Modest, hexCell: descriptionCells.winter3},   // heavy snow
    { climate: Climate.Cold , humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6},   // hail
  ];

  // need value and text, and then a way to map the values back to the weather
  //    for effects
  manualSelections = manualLookups.map() [
    { value: '', text: localize('sweath.options.biome.useClimateHumidity') },
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

}

// rather than specifying weather by biome, we take a more flexible approach (though we also define some biomes as defaults)
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
enum Direction {
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
const getDirection = (season: Season): Direction => {
  const rand = Math.random();

  // note: this relies on the specific values of the Direction enums
  for (let direction=-1, accumulator=0; direction<=5; direction++) {
    accumulator += moveProbabilities[season][direction];

    if (rand<=accumulator) {
      return direction as Direction;
    }
  }

  // shouldn't get here, but just in case
  return moveProbabilities[season][5] as Direction;
};

// keyed by season, contains the possible cell starting points for each season
const startingCells: number[][] = [[], [], [], []];

startingCells[Season.Summer] = [2, 6, 11, 17, 23, 28];
startingCells[Season.Fall] = [3, 7, 12, 18, 24, 29, 33];
startingCells[Season.Winter] = [8, 13, 19, 25, 30, 34];
startingCells[Season.Spring] = [3, 7, 12, 18, 24, 29, 33];

// indexed by Season, then the cell # you're starting in, and then Direction
const nextCell: number[][][] = [[], [], [], []];

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

// descriptions and temperatures and options are indexed by Climate, then Humidity, then cell #
// seasons are handled by controlling which parts of the grid you can get to
// we need to populate the descriptions because we might call them before localization happens
// note: length/2 because typescript enums have both the numbers and strings as keys
const weatherDescriptions: string[][][] = new Array(Object.keys(Climate).length/2)
  .fill('')
  .map(() => new Array(Object.keys(Humidity).length/2)
    .fill('')
    .map(() => new Array(37).fill('')));


const weatherTemperatures: number[][][] = new Array(Object.keys(Climate).length/2)
  .fill(0)
  .map(() => new Array(Object.keys(Humidity).length/2)
    .fill(0)
    .map(() => new Array(37).fill(0)));

type WeatherOptions = {
  fx: {
    core: {
      effect: string | null | undefined,
    }
  }
}

const weatherOptions: WeatherOptions[][][] = new Array(Object.keys(Climate).length/2)
  .fill({})
  .map(() => new Array(Object.keys(Humidity).length/2)
    .fill({})
    .map(() => new Array(37).fill({})));
  
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

// maps names to the cell ID # (could use findIndex on descriptionOrder, but this lets us use intellisense)
const descriptionCells = {
  'summer1': 0,
  'summer5': 1,
  'springfall_warm1': 2,
  'springfall1': 3,

  'summer2': 4,
  'summer6': 5,
  'springfall_warm2': 6,
  'springfall2': 7,
  'springfall_cool1': 8,

  'summer3': 9,
  'summer7': 10,
  'springfall_warm3': 11,
  'springfall3': 12,
  'springfall_cool2': 13,
  'winter1': 14,

  'summer4': 15,
  'summer8': 16,
  'springfall_warm4': 17,
  'springfall4': 18,
  'springfall_cool3': 19,
  'winter2': 20,
  'winter6': 21,

  'summer9': 22,
  'springfall_warm5': 23,
  'springfall5': 24,
  'springfall_cool4': 25,
  'winter3': 26,
  'winter7': 27,

  'springfall_warm6': 28,
  'springfall6': 29,
  'springfall_cool5': 30,
  'winter4': 31,
  'winter8': 32,

  'springfall7': 33,
  'springfall_cool6': 34,
  'winter5': 35,
  'winter9': 36,
};

///////////////////////////////////////
// define the extra metadata for each cell
// I don't like this because it's disconnected from the text strings, which makes it hard to debug
// But the alternative is to to have just a massively long file here to map all the descriptions, which
//    is likely to also lead to errors, so...

// temperatures
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

// temperatures
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

// weather options
const effects = {
  MistyRain: { 
    core: {
      effect: 'rain'
    }
  },
  LightRain: { 
    core: {
      effect: 'rain'
    }
  },
  ModerateRain: { 
    core: {
      effect: 'rainStorm'
    }
  },
  HeavyRain: {
    core: {
      effect: 'rainStorm'
    }
  },
  LightFog: { 
    core: {
      effect: 'fog'
    }
  },
  ModerateFog: { 
    core: {
      effect: 'fog'
    }
  },
  HeavyFog: { 
    core: {
      effect: 'fog'
    }
  },
  LightSnow: { 
    core: {
      effect: 'snow'
    }
  },
  ModerateSnow: { 
    core: {
      effect: 'snow'
    }
  },
  HeavySnow: { 
    core: {
      effect: 'blizzard'
    }
  },
  WhiteoutSnow: { 
    core: {
      effect: 'blizzard'
    }
  },
  Hail: { 
    core: {
      effect: 'rainStorm'
    }
  },
  Sleet: { 
    core: {
      effect: 'rainStorm'
    }
  },
}

weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer7] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall3] = { fx: effects.MistyRain };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_cool2] = { fx: effects.LightFog };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer9] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall5] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter3] = { fx: effects.WhiteoutSnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_warm6] = { fx: effects.Hail };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter4] = { fx: effects.LightSnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter5] = { fx: effects.LightSnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter9] = { fx: effects.LightSnow };

weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer6] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall3] = { fx: effects.ModerateFog };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_cool2] = { fx: effects.HeavyFog };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer8] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter3] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter7] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_warm6] = { fx: effects.Hail };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter4] = { fx: effects.Sleet };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter5] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter9] = { fx: effects.LightSnow };

weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer5] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer3] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall3] = { fx: effects.ModerateFog };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: effects.HeavyFog };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer9] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_warm5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter3] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter7] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_warm6] = { fx: effects.Hail };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter4] = { fx: effects.Sleet };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall7] = { fx: effects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter4] = { fx: effects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter9] = { fx: effects.ModerateSnow };

weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer7] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall3] = { fx: effects.MistyRain };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_cool2] = { fx: effects.LightFog };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter2] = { fx: effects.ModerateSnow };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter4] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter5] = { fx: effects.LightSnow };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter9] = { fx: effects.LightSnow };

weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer6] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall3] = { fx: effects.ModerateFog };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_cool2] = { fx: effects.HeavyFog };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter3] = { fx: effects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter7] = { fx: effects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_warm6] = { fx: effects.Hail };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter4] = { fx: effects.Sleet };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter5] = { fx: effects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter9] = { fx: effects.LightSnow };

weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer5] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_warm2] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer3] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall3] = { fx: effects.ModerateFog };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: effects.HeavyFog };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_cool5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter3] = { fx: effects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter7] = { fx: effects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_warm6] = { fx: effects.Hail };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter4] = { fx: effects.Sleet };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall7] = { fx: effects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter5] = { fx: effects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter9] = { fx: effects.ModerateSnow };

weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer7] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall3] = { fx: effects.MistyRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_cool2] = { fx: effects.LightFog };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter3] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter4] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter5] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter9] = { fx: effects.LightRain };

weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer6] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall3] = { fx: effects.ModerateFog };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_cool2] = { fx: effects.HeavyFog };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall4] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter3] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter4] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter5] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter9] = { fx: effects.LightRain };

weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer5] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_warm2] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer3] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall3] = { fx: effects.ModerateFog };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: effects.HeavyFog };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer9] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_warm5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall5] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter3] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter7] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_warm6] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall6] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter4] = { fx: effects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall7] = { fx: effects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter5] = { fx: effects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter9] = { fx: effects.ModerateRain };

export { 
  Direction,
  getDirection,
  initializeLocalizedText,
  weatherDescriptions,
  weatherTemperatures,
  weatherOptions,
  startingCells,
  nextCell,
  manualSelections,
}