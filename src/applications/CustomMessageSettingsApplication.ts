import { weatherDescriptions } from '@/weather/weatherMap';
import { ModuleSettings, ModuleSettingKeys } from '@/settings/ModuleSettings';
import moduleJson from '@module';
import { localize } from '@/utils/game';

const NUM_CLIMATES = 3;
const NUM_HUMIDITY = 3;
const NUM_WEATHER = 37;

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

    const climates = [
      localize('sweath.options.climate.cold'),
      localize('sweath.options.climate.temperate'),
      localize('sweath.options.climate.hot'),
    ];
    const humidities = [
      localize('sweath.options.humidity.barren'),
      localize('sweath.options.humidity.modest'),
      localize('sweath.options.humidity.verdant'),
    ];
  
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
    
    options.template = `modules/${moduleJson.id}/templates/custom-message-settings.hbs`;
    // options.popOut = false;  // self-contained window without the extra wrapper
    // options.resizable = false;  // window is fixed size

    return options;
  }

  public async getData(): Promise<any> {
    // load any current values
    const currentText = ModuleSettings.get(ModuleSettingKeys.customChatMessages);

    for (let i=0; i<this._flattenedDescriptions.length; i++) {
      this._flattenedDescriptions[i].currentText = currentText[this._flattenedDescriptions[i].climateId][this._flattenedDescriptions[i].humidityId][this._flattenedDescriptions[i].descriptionId];
    }

    return {
      weatherDescriptions: this._flattenedDescriptions,
    };
  }

  public async _updateObject(_event, formData: Record<string, string>): Promise<void> {
    // bundle up into settings object
    const chatMessages: string[][][] = new Array(NUM_CLIMATES)
      .fill('')
      .map(() => new Array(NUM_HUMIDITY)
        .fill('')
        .map(() => new Array(NUM_WEATHER).fill('')));

    for (let i=0; i<this._flattenedDescriptions.length; i++) {
      chatMessages[this._flattenedDescriptions[i].climateId][this._flattenedDescriptions[i].humidityId][this._flattenedDescriptions[i].descriptionId] = formData['v-'+i];
    }

    await ModuleSettings.set(ModuleSettingKeys.customChatMessages, chatMessages);
  }
}