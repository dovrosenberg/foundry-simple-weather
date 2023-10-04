enum Season {
  Spring,
  Summer,
  Fall,
  Winter
}

enum Humidity {
  Barren,
  Modest,
  Verdant
}

enum Climate {
  Cold,
  Temperate,
  Hot
}

// describes the weather for a day
// we can use humidity, climate, and gridCell to determine the text description
// season is only used so that if we want to pick the next day's weather we can tell if we've changed seasons
export class WeatherData {
  public season: Season;        // which season we were in 
  public humidity: Humidity;    // the humidity selection
  public climate: Climate;      // the climate selection
  public gridCell: number;      // number of the cell in the hex flower
  public temperature: number;   // the temperature (with random variation) in F
}
