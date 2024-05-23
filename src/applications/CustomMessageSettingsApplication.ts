import { Climate, Humidity } from '@/weather/climateData';
import { weatherDescriptions } from '@/weather/weatherMap';
import { moduleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import moduleJson from '@module';

export class CustomMessageSettingsApplication extends FormApplication {
  private _flattenedDescriptions = [] as {
    climate: string,
    climateId: number,
    humidity: string,
    humidityId: number,
    description: string,
    descriptionId: number,
    currentText: string,
  }[];

  constructor(object, options) {
    super(object, options);

    const climates = Object.values(Climate).slice(0, Object.values(Climate).length/2);
    const humidities = Object.values(Humidity).slice(0, Object.values(Humidity).length/2);

    // flatten the weatherDescriptions into an object
    for (let c=0; c<weatherDescriptions.length; c++) {
      for (let h=0; h<weatherDescriptions[c].length; h++) {
        for (let d=0; d<weatherDescriptions[c][h].length; d++) {
          this._flattenedDescriptions.push({
            climate: climates[c] as string,
            climateId: c,
            humidity: humidities[h] as string,
            humidityId: h,
            description: weatherDescriptions[c][h][d],
            descriptionId: d,
            currentText: '',
          });
        } 
      }
    }
  }

  // window options; called by parent class
  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/custom-chat-settings.hbs`;
    // options.popOut = false;  // self-contained window without the extra wrapper
    // options.resizable = false;  // window is fixed size

    return options;
  }

  public async getData(): Promise<any> {
    // load any current values
    const currentText = moduleSettings.get(ModuleSettingKeys.customChatMessages);

    for (let i=0; i<this._flattenedDescriptions.length; i++) {
      this._flattenedDescriptions[i].currentText = currentText[this._flattenedDescriptions[i].climateId][this._flattenedDescriptions[i].humidityId][this._flattenedDescriptions[i].descriptionId];
    }

    return {
      climates: Object.values(Climate).slice(0, Object.values(Climate).length/2),
      climateIndexes: [0,1,2],
      humidities: Object.values(Humidity).slice(0, Object.values(Humidity).length/2),
      humidityIndexes: [0,1,2],
      weatherDescriptions: this._flattenedDescriptions,
    };
  }

  public async _updateObject(_event, formData: Record<string, string>): Promise<void> {
    // bundle up into settings object
    const chatMessages: string[][][] = new Array(Object.keys(Climate).length/2)
      .fill('')
      .map(() => new Array(Object.keys(Humidity).length/2)
        .fill('')
        .map(() => new Array(37).fill('')));

    for (let i=0; i<this._flattenedDescriptions.length; i++) {
      chatMessages[this._flattenedDescriptions[i].climateId][this._flattenedDescriptions[i].humidityId][this._flattenedDescriptions[i].descriptionId] = formData['v-'+i];
    }

    await moduleSettings.set(ModuleSettingKeys.customChatMessages, chatMessages);
  }
}