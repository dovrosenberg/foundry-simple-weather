import { localize } from '@/utils/game';
import { log } from '@/utils/log';

export enum Season {
  Spring,
  Summer,
  Fall,
  Winter
}

export interface SeasonDescription {
  name: string;
  numericRepresentation: number;
  icon: string;
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


export type HexFlowerCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36;

// these are used to create the drop downs; the first value in each
//    subarray is the value, the second the description
export type SelectOption = { value: string, text: string};

let biomeSelections: SelectOption[];
let climateSelections: SelectOption[];
let humiditySelections: SelectOption[];
let seasonSelections: SelectOption[];

// call to set everything up after the game has loaded
export function initializeLocalizedText(): void {
  log(false, 'Loading localized climate text');

  biomeSelections = [
    { value: '', text: localize('options.biome.useClimateHumidity') },
    { value: 'tundra', text: localize('options.biome.tundra') },
    { value: 'alpine', text: localize('options.biome.alpine') },
    { value: 'taiga', text: localize('options.biome.taiga') },
    { value: 'chaparral', text: localize('options.biome.chaparral') },
    { value: 'grassland', text: localize('options.biome.grassland') },
    { value: 'forest', text: localize('options.biome.forest') },
    { value: 'desert', text: localize('options.biome.desert') },
    { value: 'savannah', text: localize('options.biome.savannah') },
    { value: 'rainForest', text: localize('options.biome.rainForest') },
  ];

  climateSelections= [
    { value: String(Climate.Cold), text: localize('options.climate.cold') },
    { value: String(Climate.Temperate), text: localize('options.climate.temperate') },
    { value: String(Climate.Hot), text: localize('options.climate.hot') },
  ];

  humiditySelections = [
    { value: String(Humidity.Barren), text: localize('options.humidity.barren') },
    { value: String(Humidity.Modest), text: localize('options.humidity.modest') },
    { value: String(Humidity.Verdant), text: localize('options.humidity.verdant') },
  ];

  seasonSelections = [
    { value: String(Season.Spring), text: localize('options.season.spring') },
    { value: String(Season.Summer), text: localize('options.season.summer') },
    { value: String(Season.Fall), text: localize('options.season.fall') },
    { value: String(Season.Winter), text: localize('options.season.winter') },
  ];
}

// if we have a simple calendar, than activate the "sync" option in the drop down
const allowSeasonSync = function() {
  seasonSelections.splice(0,0, { value: 'sync', text: localize('options.season.sync')});
};

// these map the biomes to their climate/humidity
const biomeMappings: Record<string, { climate: number, humidity: number }> = {
  tundra: { climate: Climate.Cold, humidity: Humidity.Barren },
  alpine: { climate: Climate.Cold, humidity: Humidity.Modest },
  taiga: { climate: Climate.Cold, humidity: Humidity.Verdant },
  chaparral: { climate: Climate.Temperate, humidity: Humidity.Barren },
  grassland: { climate: Climate.Temperate, humidity: Humidity.Modest },
  forest: { climate: Climate.Temperate, humidity: Humidity.Verdant },
  desert: { climate: Climate.Hot, humidity: Humidity.Barren }, 
  savannah: { climate: Climate.Hot, humidity: Humidity.Modest },
  rainForest: { climate: Climate.Hot, humidity: Humidity.Verdant },
};

export { 
  humiditySelections,
  climateSelections,
  biomeSelections,
  seasonSelections,
  allowSeasonSync,
  biomeMappings,
};
