import { Climate, HexFlowerCell, Humidity, Season, } from './climateData';
import { cellValidForSeason, descriptionCells, weatherDescriptions, weatherTemperatures } from './weatherMap';

type ManualOption = {
  climate: Climate;   // climate for the source weather to use
  humidity: Humidity;  // humidity for the source weather to use
  hexCell: HexFlowerCell;  // cell for the source weather to use
}

// this specifies the set of manual options for each season/climate/humidity
// "invalid" means it's not a valid "normal" weather for that combo, so future forecasts will try to look backwards until
//   it can find a valid combo (or we've left the season).  If it finds a valid one, it continues from there. If not, it will
//   regenerate a new start.
const manualOptionsBySeason = {
  [Season.Spring]: {
    [Climate.Cold]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Temperate]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Hot]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    }
  },
  [Season.Summer]: {
    [Climate.Cold]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Temperate]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Hot]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    }
  },
  [Season.Fall]: {
    [Climate.Cold]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Temperate]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Hot]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    }
  },
  [Season.Winter]: {
    [Climate.Cold]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Temperate]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    },
    [Climate.Hot]: {
      [Humidity.Barren]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],
      [Humidity.Modest]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ],      
      [Humidity.Verdant]: [
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool1, },   // clear sky
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer4, },   // fleecy clouds
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter6, },   // gray, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm5, },   // dark storm clouds
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.summer7, },   // light rain
        { climate: Climate.Cold, humidity: Humidity.Verdant, hexCell: descriptionCells.summer6, },   // steady rain
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.summer7, },   // heavy rain
        { climate: Climate.Temperate, humidity: Humidity.Barren, hexCell: descriptionCells.springfall_cool2, },   // light fog
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall3, },   // fog banks
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_cool2, },   // heavy fog
        { climate: Climate.Cold, humidity: Humidity.Barren, hexCell: descriptionCells.winter5, },   // light snow
        { climate: Climate.Temperate, humidity: Humidity.Verdant, hexCell: descriptionCells.winter9, },   // moderate snow, windy
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.winter3, },   // heavy snow
        { climate: Climate.Cold, humidity: Humidity.Modest, hexCell: descriptionCells.springfall_warm6, },   // hail
      ]
    }
  },
} as Record<Season, Record<Climate, Record<Humidity, ManualOption[]>>>;  

// valid tells us whether that's a normal weather option for this season, etc. or not (which determines how to forecast)
const getManualOptionsBySeason = (season: Season, climate: Climate, humidity: Humidity): {
  value: string; 
  text: string; 
  weather: ManualOption; 
  temperature: number;
  valid: boolean 
}[] => {
  return manualOptionsBySeason[season][climate][humidity].map((option: ManualOption, i: number) => ({
    value: i.toString(),
    text: weatherDescriptions[option.climate as number][option.humidity as number][option.hexCell],
    weather: option,

    temperature: weatherTemperatures[option.climate as number][option.humidity as number][option.hexCell],

    // calculate validity; valid if climate and humidity match the request and the cell is legit for the season
    valid: option.climate === climate && option.humidity === humidity && cellValidForSeason(season, option.hexCell),
  }));
}

export { 
  getManualOptionsBySeason,
}