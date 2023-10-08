import { WeatherApplication } from '@/applications/WeatherApplication';
import { ModuleSettings } from '@/settings/module-settings';
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
    this.initializeWeatherApplication();
  }

  public onCalendarDateTimeChange(currentDate: SimpleCalendar.DateData) {
    this.weatherApplication.updateDateTime(currentDate);
  }

  // public resetWindowPosition() {
  //   if (this.moduleSettings.getDialogDisplay() || isClientGM()) {
  //     this.weatherApplication.resetPosition();
  //   }
  // }

  private initializeWeatherApplication() {
    if (this.moduleSettings.getDialogDisplay() || isClientGM()) {
      this.weatherApplication = new WeatherApplication(
        this.moduleSettings,
        () => {
          // this will be called when the application is done with the initial render
          log(false, 'RENDER COMPLETE!');
        });
    }
  }
}
