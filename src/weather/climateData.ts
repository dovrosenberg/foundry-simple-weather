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

export const getDirection = (season: Season): Direction => {
  const rand = Math.random();

  // note: this relies on the specific values of the Direction enums
  for (let direction=-1, accumulator=0; direction<=5; direction++) {
    accumulator += moveProbabilities[season][accumulator];

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
  [ 0, 4, 5, 1, 15, 25 ],
  [ 0, 5, 6, 2, 1, 1 ],
  [ 1, 6, 7, 3, 28, 2 ],
  [ 2, 7, 8, 3, 33, 3 ],
  [ 4, 9, 10, 5, 0, 4 ],
  [ 4, 10, 11, 6, 1, 0 ],
  [ 5, 11, 12, 7, 2, 1 ],
  [ 6, 12, 13, 8, 3, 2 ],
  [ 7, 13, 8, 8, 34, 3 ],
  [ 9, 15, 16, 10, 4, 9 ],
  [ 9, 16, 17, 11, 5, 4 ],
  [ 10, 17, 18, 12, 6, 5 ],
  [ 11, 18, 19, 13, 7, 6 ],
  [ 12, 19, 13, 13, 8, 7 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 15, 0, 15, 16, 9, 15 ],
  [ 15, 16, 23, 16, 10, 9 ],
  [ 17, 23, 24, 18, 11, 10 ],
  [ 17, 24, 25, 19, 12, 11 ],
  [ 18, 25, 19, 19, 13, 12 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 25, 22, 28, 23, 22, 22 ],
  [ 22, 28, 29, 24, 17, 16 ],
  [ 23, 29, 30, 25, 18, 17 ],
  [ 24, 30, 25, 25, 19, 18 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 28, 2, 33, 29, 23, 22 ],
  [ 28, 33, 34, 30, 24, 23 ],
  [ 29, 34, 30, 30, 25, 24 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ -1, -1, -1, -1, -1, -1 ],
  [ 33, 3, 33, 34, 29, 28 ],
  [ 33, 8, 34, 34, 30, 29 ],
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

nextCell[Season.Spring] = [
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

// descriptions and temperatures are indexed by Climate, then Humidity, then cell #
export const weatherDescriptions: string[][][] = [[[]], [[]], [[]], [[]]];

weatherDescriptions[Climate.Cold][Humidity.Barren] = [
  'Sunny, breezy', 'Fleecy clouds', 'Wind', 'Cold winds, very dry',
  'Dry storm', 'Cloudy', 'Dry, mild', 'Grey sky', 'Clear sky', 
  'Steel blue sky', 'Light rain', 'Wispy clouds', 'Misty', 'Light fog', 'Cold, clear sky',
  'Gentle breeze, some clouds', 'Clear, dry, warm', 'Warm, clear sky', 'Mild, clear sky', 'Blue white sky', 'Cool, clear sky', 'Clear, dry, drigid, no wind', 'Gray, windy',
  'Blizzard', 'Dark storm clouds', 'Warm rain', 'Dark clouds', 'Whiteout', 'Cloudy and cold', 
  'Hail storm', 'Cumulonimbus clouds', 'Strong gale', 'Spitting snow, windy', 'Grey, fast clouds',
  'Dry thunderstom', 'Windstorm', 'Light snowfall', 'Snow flurries, windy',
];

weatherDescriptions[Climate.Cold][Humidity.Modest] = [
  'Sunny, refreshing breezes', 'Fleecy clouds', 'Wind', 'Cold winds, very dry',
  'Dry storm', 'Drizzle', 'Humid, warm', 'Grey sky', 'Barrel clouds',
  'Steel blue sky', 'Heavy rain', 'Wispy clouds', 'Fog banks', 'Heavy fog', 'Cold, clear sky',
  'Gentle breeze, some clouds', 'Clear, dry, hot', 'Warm, clear sky', 'Blue white sky', 'Cool, clear sky', 'Clear, dry, cold, no wind', 'Grey, windy',
  'Blizzard', 'Dark storm cloud', 'Warm rain', 'Dark clouds', 'Heavy snow', 'Snow storm',
  'Hail storm', 'Cumulonimbus clouds', 'Strong gale', 'Sleet, windy', 'Grey, fast clouds',
  'Dry thunderstorm', 'Windstorm', 'Blizzard', 'Light snowfall, windy',
];

weatherDescriptions[Climate.Cold][Humidity.Verdant] = [
  'Sunny, refreshing breezes', 'Drizzle', 'Wind', 'Cold winds, very dry',
  'Dry storm', 'Steady rain', 'Light rain, warm', 'Grey sky', 'Barrel clouds',
  'Steel blue sky', 'Downpour', 'Wispy clouds', 'Rolling fog', 'Heavy fog', 'Cold, clear sky',
  'Gentle breeze, some clouds', 'Clear, dry, hot', 'Humid, warm, clear sky', 'Blue white sky', 'Cool, clear sky', 'Clear, dry, cold, no wind', 'Grey, windy',
  'Blizzard', 'Storming, rain', 'Warm rain', 'Humid, dark clouds, threatening rain', 'Heavy snow', 'Thick snow',
  'Hail storm', 'Warm rain', 'Strong gale', 'Sleet, windy, rain', 'Grey, fast clouds', 
  'Thunderstom with spitting rain', 'Windstorm', 'Blizzard', 'Moderate snowfall, windy',
];