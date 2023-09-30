import { WeatherData } from '../models/weatherData';

export class PrecipitationsGenerator {

  constructor(private gameRef: Game) {}

  /**
   *
   * @param roll Number between 1 and 20
   * @returns
   */
  public generate(roll: number, weatherData: WeatherData) {
    let weather = '';
    const effects = [];

    if (roll <= 3) {
      if (weatherData.isVolcanic) {
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Ashen');
      } else {
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Clear');
      }
    } else if (roll <= 6) {
      if (weatherData.isVolcanic) {
        effects.push({
          type: 'clouds',
          options: {
            density: '13',
            speed: '29',
            scale: '34',
            tint: '#4a4a4a',
            direction: '50',
            apply_tint: true
          }
        });
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Dark');
      } else {
        effects.push({
          type: 'clouds',
          options: {
            density: '13',
            speed: '29',
            scale: '34',
            tint: '#bcbcbc',
            direction: '50',
            apply_tint: true
          }
        });
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Scattered');
      }
    } else if (roll == 7) {
      if (weatherData.isVolcanic) {
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.SunAsh');
      } else {
        if (weatherData.temp < 25) {
          effects.push({
            type: 'clouds',
            options: {
              density: '41',
              speed: '29',
              scale: '34',
              tint: '#bcbcbc',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'snow',
            options: {
              density: '30',
              speed: '31',
              scale: '17',
              tint: '#000000',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Overcast');
        } else if (weatherData.temp < 32) {
          effects.push({
            type: 'clouds',
            options: {
              density: '41',
              speed: '29',
              scale: '34',
              tint: '#bcbcbc',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'rain',
            options: {
              density: '19',
              speed: '50',
              scale: '31',
              direction: '50',
            }
          });
          effects.push({
            type: 'snow',
            options: {
              density: '30',
              speed: '31',
              scale: '17',
              direction: '50',
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.OvercastLight');
        } else {
          effects.push({
            type: 'clouds',
            options: {
              density: '40',
              speed: '29',
              scale: '20',
              tint: '#bcbcbc',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'rain',
            options: {
              density: '40',
              speed: '50',
              scale: '30',
              tint: '#acd2cd',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.OvercastDrizzle');
        }
      }
    } else if (roll == 8) {
      if (weatherData.isVolcanic) {
        effects.push({
          type: 'snow',
          options: {
            density: '50',
            speed: '50',
            scale: '50',
            tint: '#000000',
            direction: '50',
            apply_tint: true
          }
        });
        effects.push({
          type: 'embers',
          options: {
            density: '50',
            speed: '50',
            scale: '50',
            tint: '#ff1c1c',
            direction: '50',
            apply_tint: true
          }
        });
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Ashfall');
      } else {
        if (weatherData.temp < 25) {
          effects.push({
            type: 'snow',
            options: {
              density: '50',
              speed: '50',
              scale: '50',
              tint: '#ffffff',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.LightSnow');
        } else if (weatherData.temp < 32) {
          effects.push({
            type: 'snow',
            options: {
              density: '25',
              speed: '50',
              scale: '25',
              tint: '#ffffff',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'rain',
            options: {
              density: '25',
              speed: '50',
              scale: '50',
              tint: '#acd2cd',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.LightRain');
        } else {
          effects.push({
            type: 'rain',
            options: {
              density: '50',
              speed: '50',
              scale: '50',
              tint: '#acd2cd',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.ModerateRainW');
        }
      }

    } else if (roll == 9) {
      if (weatherData.isVolcanic) {
        effects.push({
          type: 'rain',
          options: {
            density: '72',
            speed: '50',
            scale: '67',
            tint: '#ff8040',
            direction: '50',
            apply_tint: true
          }
        });
        effects.push({
          type: 'embers',
          options: {
            density: '50',
            speed: '50',
            scale: '50',
            tint: '#ff1c1c',
            direction: '50',
            apply_tint: true
          }
        });
        weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.FireyRain');
      } else {
        if (weatherData.temp < 25) {
          effects.push({
            type: 'snow',
            options: {
              density: '72',
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.LargeSnow');
        } else if (weatherData.temp < 32) {
          effects.push({
            type: 'snow',
            options: {
              density: '50',
              speed: '50',
              scale: '50',
              tint: '#ffffff',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'rain',
            options: {
              density: '50',
              speed: '50',
              scale: '50',
              tint: '#acd2cd',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.LargeFreezingRain');
        } else {
          effects.push({
            type: 'rain',
            options: {
              density: '72',
              speed: '50',
              scale: '67',
              tint: '#acd2cd',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.HeavyRain');
        }
      }

    } else if (roll >= 10) {
      if (this.rand(1, 20) == 20) {
        weather = this.extremeWeather(weatherData);
      } else {
        if (weatherData.isVolcanic) {
          effects.push({
            type: 'rain',
            options: {
              density: '100',
              speed: '75',
              scale: '100',
              tint: '#ff8040',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'embers',
            options: {
              density: '100',
              speed: '50',
              scale: '100',
              tint: '#ff1c1c',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'snow',
            options: {
              density: '50',
              speed: '50',
              scale: '50',
              tint: '#ffffff',
              direction: '50',
              apply_tint: true
            }
          });
          effects.push({
            type: 'clouds',
            options: {
              density: '50',
              speed: '8',
              scale: '50',
              tint: '#d2e8ce',
              direction: '50',
              apply_tint: true
            }
          });
          weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Earthquake');
        } else {
          if (weatherData.temp < 25) {
            effects.push({
              type: 'snow',
              options: {
                density: '100',
                speed: '75',
                scale: '100',
                tint: '#ffffff',
                direction: '50',
                apply_tint: true
              }
            });
            effects.push({
              type: 'clouds',
              options: {
                density: '50',
                speed: '50',
                scale: '50',
                direction: '50',
              }
            });
            weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Blizzard');
          } else if (weatherData.temp < 32) {
            effects.push({
              type: 'snow',
              options: {
                density: '50',
                speed: '50',
                scale: '50',
                tint: '#ffffff',
                direction: '50',
                apply_tint: true
              }
            });
            effects.push({
              type: 'rain',
              options: {
                density: '83',
                speed: '17',
                scale: '100',
                tint: '#ffffff',
                direction: '50',
                apply_tint: true
              }
            });
            effects.push({
              type: 'clouds',
              options: {
                density: '50',
                speed: '50',
                scale: '50',
                direction: '50',
              }
            });
            weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.Icestorm');
          } else {
            effects.push({
              type: 'rain',
              options: {
                density: '100',
                speed: '75',
                scale: '100',
                tint: '#acd2cd',
                direction: '50',
                apply_tint: true
              }
            });
            effects.push({
              type: 'rain',
              options: {
                density: '100',
                speed: '75',
                scale: '100',
                tint: '#acd2cd',
                direction: '50',
                apply_tint: true
              }
            });
            effects.push({
              type: 'clouds',
              options: {
                density: '50',
                speed: '50',
                scale: '50',
                direction: '50',
              }
            });
            weather = this.gameRef.i18n.localize('sweath.weather.tracker.normal.TorrentialRain');
          }
        }

      }
    }

    return weather;
  }

  /**
   * GEnerate extreme weather and return it's message to be displayed in the chat.
   * @returns
   */
  private extremeWeather(weatherData: WeatherData) {
    const roll = this.rand(1, 5);
    let event = '';
    if (weatherData.isVolcanic) {
      return this.gameRef.i18n.localize('sweath.weather.tracker.extreme.VolcanoEruption');
    }
    switch (roll) {
    case 1:
      event = this.gameRef.i18n.localize('sweath.weather.tracker.extreme.Tornado');
      break;
    case 2:
      event = this.gameRef.i18n.localize('sweath.weather.tracker.extreme.Hurricane');
      break;
    case 3:
      event = this.gameRef.i18n.localize('sweath.weather.tracker.extreme.Drought');
      break;
    case 4:
      event = this.gameRef.i18n.localize('sweath.weather.tracker.extreme.BaseballHail');
      break;
    case 5:
      if (weatherData.temp <= 32) {
        event = this.gameRef.i18n.localize('sweath.weather.tracker.extreme.Blizzard');
      } else {
        event = this.gameRef.i18n.localize('sweath.weather.tracker.extreme.Monsoon');
      }
      break;
    }
    return this.gameRef.i18n.localize('sweath.weather.tracker.extreme.Extreme') + event;
  }

  /**
  * Generate a random number between to boundaries
  * @param min
  * @param max
  * @returns Random number
  */
  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
