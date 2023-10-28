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
    { value: String(Season.Spring), text: localize('sweath.options.season.spring') },
    { value: String(Season.Summer), text: localize('sweath.options.season.summer') },
    { value: String(Season.Fall), text: localize('sweath.options.season.fall') },
    { value: String(Season.Winter), text: localize('sweath.options.season.winter') },
  ];
}

// if we have a simple calendar, than activate the "sync" option in the drop down
const allowSeasonSync = function() {
  seasonSelections.splice(0,0, { value: 'sync', text: localize('sweath.options.season.sync')});
};

// these map the biomes to their climate/humidity
const biomeMappings: Record<string, { climate: number, humidity: number }> = {
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

export { 
  humiditySelections,
  climateSelections,
  biomeSelections,
  seasonSelections,
  allowSeasonSync,
  biomeMappings,
};
