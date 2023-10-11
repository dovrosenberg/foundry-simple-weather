import { WeatherApplication } from '@/applications/WeatherApplication';
import { ModuleSettings, SettingKeys } from '@/settings/module-settings';
import { log } from '@/utils/log';
import { isClientGM } from '@/utils/game';


// /**
//  * The base class of the module.  Needed to enable control from the console or other applications (vs. putting all functionality in main.ts)
//  */
export class SimpleWeather {
  private moduleSettings: ModuleSettings;
  private weatherApplication: WeatherApplication;

  constructor(moduleSettings: ModuleSettings) {
    this.moduleSettings = moduleSettings;

    log(false, 'SimpleWeather created');
  }

  // call after SimpleCalendar has been loaded ('simple-calendar-ready') hook
  public async onCalendarReady(): Promise<void> {
    if (this.moduleSettings.get(SettingKeys.dialogDisplay) || isClientGM()) {
      this.weatherApplication = new WeatherApplication(this.moduleSettings, (): SimpleCalendar.DateData | null => {
        return SimpleCalendar.api.timestampToDate(SimpleCalendar.api.timestamp());
      });
    }
  }

  // note: the actual update is async, so this handler isn't guaranteed to have actually recorded any changes when it returns
  public onCalendarDateTimeChange(currentDate: SimpleCalendar.DateData) {
    this.weatherApplication.updateDateTime(currentDate);
  }

  // public resetWindowPosition() {
  //   if (this.moduleSettings.get(SettingKeys.dialogDisplay) || isClientGM()) {
  //     this.weatherApplication.resetPosition();
  //   }
  // }

}
