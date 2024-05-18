import { Climate, Humidity } from '@/weather/climateData';
import { weatherDescriptions } from '@/weather/weatherMap';
import moduleJson from '@module';

export class CustomMessageSettingsApplication extends FormApplication {
  // window options; called by parent class
  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/custom-chat-settings.hbs`;
    // options.popOut = false;  // self-contained window without the extra wrapper
    // options.resizable = false;  // window is fixed size

    return options;
  }

  public async getData(): Promise<any> {
    const flattenedDescriptions = [] as {
      climate: string,
      climateId: number,
      humidity: string,
      humidityId: number,
      description: string,
      descriptionId: number,
    }[];
    const climates = Object.values(Climate).slice(0, Object.values(Climate).length/2);
    const humidities = Object.values(Humidity).slice(0, Object.values(Humidity).length/2);

    // flatten the weatherDescriptions into an object
    for (let c=0; c<weatherDescriptions.length; c++) {
      for (let h=0; h<weatherDescriptions[c].length; h++) {
        for (let d=0; d<weatherDescriptions[c][h].length; d++) {
          flattenedDescriptions.push({
            climate: climates[c] as string,
            climateId: c,
            humidity: humidities[c] as string,
            humidityId: h,
            description: weatherDescriptions[c][h][d],
            descriptionId: d,
          });
        } 
      }
    }

    return {
      climates: Object.values(Climate).slice(0, Object.values(Climate).length/2),
      climateIndexes: [0,1,2],
      humidities: Object.values(Humidity).slice(0, Object.values(Humidity).length/2),
      humidityIndexes: [0,1,2],
      weatherDescriptions: flattenedDescriptions
    };
  }

  _updateObject(event, formData) {
    alert(JSON.stringify(expandObject(formData)));
  //   const data = expandObject(formData);
  //   game.settings.set('myModuleId', 'myComplexSettingName', data);
  }
}