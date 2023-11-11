import { localize } from '@/utils/game';
import { log } from '@/utils/log';
import { Climate, Humidity, Season } from './climateData';
import { availableEffects, EffectDetails, joinEffects } from '@/weather/effectsMap';

// drop down selections for manually setting weather
let manualSelections: { text:string, value: string}[];

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

  // need value and text, and then a way to map the values back to the weather
  //    for effects
  manualSelections = manualOptions.map((val, i) =>
      ({ value: i.toString(), text: weatherDescriptions[val?.climate as number][val?.humidity as number][val?.hexCell as number] }));
}

// rather than specifying weather by biome, we take a more flexible approach (though we also define some biomes as defaults)
// this approach allows GMs to create non-earth biomes (ex. what's the weather like in the Fey realm or another plane?) and 
//    still easily use the tool

// this approach borrows from Dave's All-Purpose Weather Table from reddit u/AlliedSalad2
// https://docs.google.com/spreadsheets/d/1j0d1MtsWtJT-Q-Ncbl8DsBlf6cK51j5T13JTll5bSTE/edit#gid=0

// but it's heavilty based on this weather system (see /docs/weather.png) from reddit user iceandstorm as described in the comments to this post: 
//    https://www.reddit.com/r/rpg/comments/p0wq9n/weather_hex_flower_random_weather_generation/

// the numbered cells in the hex flower

//                      3
//                 2        8		
//             1        7  	     14	
//         0       6	  	   13	  	 21
//             5 		    12  		 20	
//         4		   11  		   19		   27
//             10		    18	  	 26	
//         9		   17	  	   25		   32
//             16		    24	  	 31	
//         15		   23	  	   30		   36
//             22		    29		   35	
//                 28	  	   34		
//                      33			

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

startingCells[Season.Summer] = [ 9, 10, 11, 12, 13, 14, ];
startingCells[Season.Fall] = [ 15, 16, 17, 18, 19, 20, 21,];
startingCells[Season.Winter] = [ 22, 23, 24, 25, 26, 27, ];
startingCells[Season.Spring] = [ 15, 16, 17, 18, 19, 20, 21, ];

// indexed by Season, then the cell # you're starting in, and then Direction
const nextCell: number[][][] = [[], [], [], []];

nextCell[Season.Summer] = [
  // N, NE, SE, S, SW, NW
  [ 0, 1, 5, 4, 3, 18, ],
  [ 1, 2, 6, 5, 0, 1, ],
  [ 2, 3, 7, 6, 1, 2, ],
  [ 3, 0, 3, 7, 2, 3, ],
  [ 0, 5, 10, 9, 4, 4, ],
  [ 1, 6, 11, 10, 4, 0, ],
  [ 2, 7, 12, 11, 5, 1, ],
  [ 3, 7, 13, 7, 6, 2, ],
  [ 19, 8, 14, 13, 8, 8, ],
  [ 4, 10, 10, 9, 14, 9, ],
  [ 5, 11, 11, 11, 9, 4, ],
  [ 6, 12, 12, 11, 10, 5, ],
  [ 12, 13, 13, 12, 11, 6, ],
  [ 8, 14, 14, 8, 12, 7, ],
  [ 14, 9, 9, 14, 13, 8, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
];

nextCell[Season.Fall] = [
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ 9, 10, 16, 15, 14, 9, ],
  [ 10, 11, 17, 16, 9, 10, ],
  [ 11, 12, 18, 17, 10, 11, ],
  [ 12, 13, 19, 18, 11, 12, ],
  [ 13, 14, 20, 19, 12, 13, ],
  [ 14, 9, 21, 20, 13, 14, ],
  [ 9, 16, 22, 15, 21, 15, ],
  [ 10, 17, 23, 22, 15, 9, ],
  [ 11, 18, 24, 23, 16, 10, ],
  [ 12, 19, 25, 24, 17, 11, ],
  [ 13, 20, 26, 25, 18, 12, ],
  [ 14, 21, 27, 26, 19, 13, ],
  [ 21, 15, 21, 27, 20, 14, ],
  [ 16, 23, 22, 22, 27, 15, ],
  [ 17, 24, 23, 23, 22, 16, ],
  [ 18, 25, 24, 24, 23, 17, ],
  [ 19, 26, 25, 25, 24, 18, ],
  [ 20, 27, 26, 26, 25, 19, ],
  [ 21, 22, 27, 27, 26, 20, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
];

nextCell[Season.Winter] = [
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  [ -1, -1, -1, -1, -1, -1, ],
  // N, NE, SE, S, SW, NW
  [ 22, 23, 28, 22, 27, 22, ],
  [ 28, 24, 29, 28, 22, 23, ],
  [ 24, 25, 30, 24, 23, 23, ],
  [ 30, 26, 31, 30, 24, 36, ],
  [ 26, 27, 32, 31, 25, 26, ],
  [ 27, 22, 27, 27, 26, 27, ],

  [ 23, 29, 33, 17, 28, 22, ],
  [ 29, 30, 34, 33, 28, 23, ],
  [ 25, 31, 35, 34, 29, 24, ],
  [ 26, 32, 36, 35, 30, 25, ],
  [ 32, 32, 32, 36, 31, 26, ],

  [ 29, 34, 33, 33, 36, 28, ],
  [ 30, 35, 34, 34, 33, 29, ],
  [ 31, 32, 36, 35, 35, 30, ],
  [ 32, 33, 18, 36, 35, 31, ],
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
  fx: EffectDetails
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
  'summer.2',
  'summer.3',
  'summer.5',
  'summer.4',
  'summer.6',
  'summer.7',
  'summer.8',
  'summer.9',

  'springfall.warm.1',
  'springfall.warm.2',
  'springfall.warm.3',
  'springfall.warm.4',
  'springfall.warm.5',
  'springfall.warm.6',

  'springfall.1',
  'springfall.2',
  'springfall.3',
  'springfall.4',
  'springfall.5',
  'springfall.6',
  'springfall.7',

  'springfall.cool.1',
  'springfall.cool.2',
  'springfall.cool.3',
  'springfall.cool.4',
  'springfall.cool.5',
  'springfall.cool.6',

  'winter.1',
  'winter.2',
  'winter.3',
  'winter.4',
  'winter.5',
  'winter.6',
  'winter.7',
  'winter.8',
  'winter.9',
];

// maps names to the cell ID # (could use findIndex on descriptionOrder, but this lets us use intellisense)
const descriptionCells = {
  'summer1': 0,
  'summer2': 1,
  'summer3': 2,
  'summer4': 3,
  'summer5': 4,
  'summer6': 5,
  'summer7': 6,
  'summer8': 7,
  'summer9': 8,

  'springfall_warm1': 9,
  'springfall_warm2': 10,
  'springfall_warm3': 11,
  'springfall_warm4': 12,
  'springfall_warm5': 13,
  'springfall_warm6': 14,

  'springfall1': 15,
  'springfall2': 16,
  'springfall3': 17,
  'springfall4': 18,
  'springfall5': 19,
  'springfall6': 20,
  'springfall7': 21,

  'springfall_cool1': 22,
  'springfall_cool2': 23,
  'springfall_cool3': 24,
  'springfall_cool4': 25,
  'springfall_cool5': 26,
  'springfall_cool6': 27,

  'winter1': 28,
  'winter2': 29,
  'winter3': 30,
  'winter4': 31,
  'winter5': 32,
  'winter6': 33,
  'winter7': 34,
  'winter8': 35,
  'winter9': 36,
};

const manualOptions = [  // build list of manual weather options; for simplicity, we steal them from ones that already exist
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
  { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3},   // heavy snow
  { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6},   // hail
];


///////////////////////////////////////
// define the extra metadata for each cell
// I don't like this because it's disconnected from the text strings, which makes it hard to debug
// But the alternative is to to have just a massively long file here to map all the descriptions, which
//    is likely to also lead to errors, so...

// temperatures

weatherTemperatures[Climate.Cold][Humidity.Barren] = [
  44, 51, 60, 47,
  42, 46, 49, 75, 36,
  30, 32, 28, 40, 49, 32,
  23, 18, 14, 32, 36, 51, 36,
  11, 9, 19, 30, 23, 32,
  -3, -53, -15, 18, -38,
  -24, -35, -9, 4,
];

weatherTemperatures[Climate.Cold][Humidity.Modest] = [
  44, 51, 60, 47,
  42, 46, 49, 80, 36,
  30, 32, 28, 40, 49, 32,
  23, 18, 14, 32, 36, 51, 36,
  11, 9, 19, 30, 23, 32,
  -3, -53, -15, 18, -38,
  -24, -35, -9, 4,
];

weatherTemperatures[Climate.Cold][Humidity.Verdant] = [
  44, 51, 60, 47,
  42, 46, 49, 75, 36,
  30, 32, 28, 40, 49, 32,
  23, 18, 14, 32, 36, 51, 36,
  11, 9, 19, 30, 23, 32,
  -3, -53, -15, 18, -38,
  -24, -35, -9, 4,
];

weatherTemperatures[Climate.Temperate][Humidity.Barren] = [
  79, 83, 87, 73,
  78, 90, 81, 100, 75,
  72, 73, 71, 77, 81, 73,
  68, 66, 64, 73, 75, 83, 75,
  63, 61, 66, 72, 68, 73,
  55, 30, 49, 66, 38,
  44, 39, 52, 59,
];

weatherTemperatures[Climate.Temperate][Humidity.Modest] = [
  70, 77, 86, 73,
  68, 72, 83, 110, 63,
  67, 59, 55, 66, 75, 59,
  50, 45, 41, 59, 63, 77, 63,
  39, 37, 46, 57, 50, 59,
  25, -23, 14, 45, -8,
  5, -6, 19, 32,
];

weatherTemperatures[Climate.Temperate][Humidity.Verdant] = [
  70, 77, 86, 73,
  68, 72, 83, 110, 63,
  67, 59, 55, 66, 75, 59,
  36, 32, 38, 59, 63, 77, 63,
  28, 26, 46, 52, 50, 59,
  16, -23, 14, 45, -10,
  0, -6, 19, 22,
];

weatherTemperatures[Climate.Hot][Humidity.Barren] = [
  93, 96, 100, 94,
  92, 94, 95, 110, 90,
  87, 88, 86, 91, 95, 88,
  84, 82, 80, 88, 90, 96, 90,
  79, 78, 82, 87, 84, 88,
  73, 51, 67, 82, 58,
  66, 59, 70, 76,
];

weatherTemperatures[Climate.Hot][Humidity.Modest] = [
  79, 80, 82, 79,
  79, 79, 80, 86, 78,
  77, 77, 76, 78, 80, 77,
  75, 74, 73, 77, 78, 80, 78,
  73, 73, 74, 76, 75, 77,
  71, 61, 68, 74, 64,
  63, 65, 69, 72,
];

weatherTemperatures[Climate.Hot][Humidity.Verdant] = [
  85, 86, 87, 85,
  84, 85, 85, 91, 84,
  83, 83, 82, 84, 85, 83,
  82, 81, 80, 83, 84, 86, 83,
  80, 80, 81, 83, 82, 83,
  78, 70, 76, 81, 73,
  75, 73, 77, 79,
];

//0-8 - summer
//9-14 - warm
//15-21 - spring/fall
//22-27 - cold
//28-36 - winter

weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer2] = { fx: joinEffects(availableEffects.Overcast, availableEffects.BlusterWind) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer4] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer5] = { fx: joinEffects(availableEffects.LightClouds, availableEffects.LightWind) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.summer9] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_warm1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_warm3] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_warm5] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_warm6] = { fx: joinEffects(availableEffects.Hail, availableEffects.StormClouds) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall1] = { fx: availableEffects.ModerateWind };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall2] = { fx: availableEffects.Overcast };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall3] = { fx: joinEffects(availableEffects.LightFog, availableEffects.BlusterRain) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall7] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_cool2] = { fx: availableEffects.LightFog };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_cool4] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_cool5] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.springfall_cool6] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter3] = { fx: availableEffects.WhiteoutSnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter4] = { fx: availableEffects.BlusterSnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter5] = { fx: availableEffects.LightSnow };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter6] = { fx: joinEffects(availableEffects.Overcast, availableEffects.ModerateWind) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter7] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter8] = { fx: joinEffects(availableEffects.Overcast, availableEffects.LightClouds) };
weatherOptions[Climate.Cold][Humidity.Barren][descriptionCells.winter9] = { fx: availableEffects.BlusterSnow };

weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer2] = { fx: joinEffects(availableEffects.Overcast, availableEffects.BlusterWind) };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer4] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer5] = { fx: joinEffects(availableEffects.LightClouds, availableEffects.LightWind) };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer6] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.summer9] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_warm1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_warm3] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_warm5] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_warm6] = { fx: joinEffects(availableEffects.Hail, availableEffects.StormClouds) };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall1] = { fx: availableEffects.ModerateWind };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall2] = { fx: availableEffects.Overcast };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall3] = { fx: availableEffects.RollingFog };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall7] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_cool1] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_cool2] = { fx: availableEffects.HeavyFog };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_cool4] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_cool5] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.springfall_cool6] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter3] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter4] = { fx: availableEffects.Sleet };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter5] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter6] = { fx: joinEffects(availableEffects.Overcast, availableEffects.ModerateWind) };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter7] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter8] = { fx: joinEffects(availableEffects.Overcast, availableEffects.LightClouds) };
weatherOptions[Climate.Cold][Humidity.Modest][descriptionCells.winter9] = { fx: availableEffects.BlusterSnow };

weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer3] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer6] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.summer9] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_warm5] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_warm6] = { fx: availableEffects.Hail };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall3] = { fx: availableEffects.ModerateFog };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall5] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall6] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter3] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter4] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter7] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Cold][Humidity.Verdant][descriptionCells.winter9] = { fx: availableEffects.ModerateSnow };

weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer2] = { fx: joinEffects(availableEffects.Overcast, availableEffects.BlusterWind) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer4] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer5] = { fx: joinEffects(availableEffects.LightClouds, availableEffects.LightWind) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.summer9] = { fx: availableEffects.Wildfire };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_warm1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_warm3] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_warm5] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_warm6] = { fx: joinEffects(availableEffects.HeavyRain, availableEffects.Overcast) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall1] = { fx: availableEffects.ModerateWind };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall2] = { fx: availableEffects.Overcast };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall3] = { fx: joinEffects(availableEffects.LightFog, availableEffects.BlusterRain) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall7] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_cool2] = { fx: availableEffects.LightFog };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_cool4] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_cool5] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.springfall_cool6] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter2] = { fx: availableEffects.ModerateSnow };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter4] = { fx: joinEffects(availableEffects.LightRain, availableEffects.ModerateWind) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter5] = { fx: availableEffects.LightSnow };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter6] = { fx: joinEffects(availableEffects.Overcast, availableEffects.ModerateWind) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter7] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter8] = { fx: joinEffects(availableEffects.Overcast, availableEffects.LightClouds) };
weatherOptions[Climate.Temperate][Humidity.Barren][descriptionCells.winter9] = { fx: availableEffects.BlusterSnow };

weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer2] = { fx: joinEffects(availableEffects.Overcast, availableEffects.BlusterWind) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer4] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer5] = { fx: joinEffects(availableEffects.LightClouds, availableEffects.LightWind) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer6] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.summer9] = { fx: joinEffects(availableEffects.StormClouds, joinEffects(availableEffects.Hail, joinEffects(availableEffects.HeavyWind, availableEffects.Lightning))) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_warm1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_warm3] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_warm5] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_warm6] = { fx: joinEffects(availableEffects.Hail, availableEffects.StormClouds) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall1] = { fx: availableEffects.ModerateWind };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall2] = { fx: availableEffects.Overcast };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall3] = { fx: availableEffects.RollingFog };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall7] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_cool1] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_cool2] = { fx: availableEffects.HeavyFog };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_cool4] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_cool5] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.springfall_cool6] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter3] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter4] = { fx: availableEffects.Sleet };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter5] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter6] = { fx: joinEffects(availableEffects.Overcast, availableEffects.ModerateWind) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter7] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter8] = { fx: joinEffects(availableEffects.Overcast, availableEffects.LightClouds) };
weatherOptions[Climate.Temperate][Humidity.Modest][descriptionCells.winter9] = { fx: availableEffects.BlusterSnow };

weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer3] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer6] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.summer7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_warm2] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_warm6] = { fx: availableEffects.Hail };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall3] = { fx: availableEffects.ModerateFog };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall5] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall6] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: availableEffects.HeavyFog };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.springfall_cool5] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter3] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter4] = { fx: availableEffects.Sleet };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter5] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter7] = { fx: availableEffects.HeavySnow };
weatherOptions[Climate.Temperate][Humidity.Verdant][descriptionCells.winter9] = { fx: availableEffects.ModerateSnow };

weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer2] = { fx: availableEffects.DustStorm };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer4] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer5] = { fx: joinEffects(availableEffects.LightClouds, availableEffects.LightWind) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.summer9] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_warm1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_warm3] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_warm5] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_warm6] = { fx: joinEffects(availableEffects.HeavyRain, availableEffects.Overcast) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall1] = { fx: availableEffects.ModerateWind };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall2] = { fx: availableEffects.Overcast };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall3] = { fx: joinEffects(availableEffects.LightFog, availableEffects.BlusterRain) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall7] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_cool2] = { fx: availableEffects.LightFog };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_cool4] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_cool5] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.springfall_cool6] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter3] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter4] = { fx: joinEffects(availableEffects.LightRain, availableEffects.ModerateWind) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter5] = { fx: availableEffects.BlusterRain };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter6] = { fx: joinEffects(availableEffects.Overcast, availableEffects.ModerateWind) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter7] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter8] = { fx: joinEffects(availableEffects.Overcast, availableEffects.LightClouds) };
weatherOptions[Climate.Hot][Humidity.Barren][descriptionCells.winter9] = { fx: joinEffects(availableEffects.BlusterRain, availableEffects.ModerateWind) };

weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer2] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer4] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer5] = { fx: joinEffects(availableEffects.LightClouds, availableEffects.LightWind) };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer6] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.summer9] = { fx: availableEffects.Wildfire };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_warm1] = { fx: availableEffects.LightWind };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_warm3] = { fx: availableEffects.LightClouds };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_warm5] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_warm6] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall1] = { fx: availableEffects.ModerateWind };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall2] = { fx: availableEffects.Overcast };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall3] = { fx: availableEffects.RollingFog };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall6] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall7] = { fx: joinEffects(availableEffects.StormClouds, availableEffects.Lightning) };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_cool1] = { fx: availableEffects.ModerateClouds };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_cool2] = { fx: availableEffects.HeavyFog };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_cool4] = { fx: availableEffects.StormClouds };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_cool5] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.springfall_cool6] = { fx: availableEffects.HeavyWind };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter3] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter4] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter5] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter6] = { fx: joinEffects(availableEffects.Overcast, availableEffects.ModerateWind) };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter8] = { fx: joinEffects(availableEffects.Overcast, availableEffects.LightClouds) };
weatherOptions[Climate.Hot][Humidity.Modest][descriptionCells.winter9] = { fx: joinEffects(availableEffects.LightRain, availableEffects.ModerateWind) };

weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer3] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer5] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer6] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.summer9] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_warm2] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_warm5] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_warm6] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall3] = { fx: availableEffects.ModerateFog };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall5] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall6] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall7] = { fx: availableEffects.LightRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.springfall_cool2] = { fx: availableEffects.HeavyFog };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter3] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter4] = { fx: availableEffects.ModerateRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter5] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter7] = { fx: availableEffects.HeavyRain };
weatherOptions[Climate.Hot][Humidity.Verdant][descriptionCells.winter9] = { fx: availableEffects.ModerateRain };

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
  manualOptions,
}