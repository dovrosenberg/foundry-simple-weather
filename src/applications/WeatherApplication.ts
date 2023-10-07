import moduleJson from '@module';

import { log } from '@/utils/log';
import { Humidity, Climate, Season, WeatherData } from '@/weather/WeatherData';
import { WindowPosition } from '@/window/WindowPosition';
import { ModuleSettings } from '@/settings/module-settings';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';
import { generate } from '@/weather/weatherGenerator';

export class WeatherApplication extends Application {
  private windowDragHandler: WindowDrag;
  private moduleSettings: ModuleSettings;
  private renderCompleteCallback: () => void;

  // renderCompleteCallback will be called when listeners are activated, so can contain
  //    any logic that needs to be activated at that point
  constructor(moduleSettings: ModuleSettings, renderCompleteCallback: () => void) {
    super();

    this.moduleSettings = moduleSettings;
    this.renderCompleteCallback = renderCompleteCallback;

    log(false, 'WeatherApplication construction');
    this.render(true);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/weather-dialog.html`;
    options.popOut = false;
    options.resizable = false;

    return options;
  }

  // this provides fields that will be available in the template
  public getData(): any {
    return {
      isGM: isClientGM()
    };
  }

  // called by the parent class to attach event handlers
  public activateListeners(html: JQuery) {
    this.renderCompleteCallback();
    // const dateFormatToggle = '#date-display';
    // const startStopClock = '#start-stop-clock';

    this.initializeWindowInteractions(html);

    // html.find(dateFormatToggle).on('mousedown', event => {
    //   this.onMouseDownToggleDateFormat(event);
    // });

    // html.find(startStopClock).on('mousedown', event => {
    //   this.onMouseDownStartStopClock(event);
    // });

    // this.listenToWindowExpand(html);
    // this.listenToWeatherRefreshClick(html);
    // //this.setClimate(html);
    // //this.listenToClimateChange(html);

    // // expose a SimpleWeather global object to enable calling resetPosition
    // global.SimpleWeather = {};
    // global.SimpleWeather.resetPosition = () => this.resetPosition();
  }

  // refreshes the weather shown in the weather dialog
  // public updateWeather(weatherData: WeatherData) {
  //   this.assignElement('current-temperature', weatherData.getTemperature(this.settings.getUseCelsius()));
  //   this.assignElement('current-description', weatherData.getDescription());
  // }

  // private assignElement(elementId: string, value: string) {
  //   const element = document.getElementById(elementId);
  //   if (element !== null)
  //     element.innerHTML  = value;
  // }

  // // updates the current date/time showing in the weather dialog
  // public updateDateTime(currentDate: SimpleCalendar.DateData) {
  //   if (currentDate) {
  //     this.assignElement('weekday', currentDate.weekdays[currentDate.dayOfTheWeek]);

  //     this.assignElement('date', currentDate.display.date);
  //     this.assignElement('date-num', currentDate.day + '/' + currentDate.month + '/' + currentDate.year);
  //     this.assignElement('calendar-time', currentDate.display.time);
  //   }
  // }

  // resets the window's position to the default
  public resetPosition() {
    const defaultPosition = { top: 100, left: 100 };
    const element = document.getElementById('sweath-container');
    if (element) {
      log(false,'Resetting Window Position');
      element.style.top = defaultPosition.top + 'px';
      element.style.left = defaultPosition.left + 'px';
      this.moduleSettings.setWindowPosition({top: element.offsetTop, left: element.offsetLeft});
      element.style.bottom = '';
    }
  }

  // // listener activators
  // private listenToWindowExpand(html: JQuery) {
  //   // hide the toggle for non-GM clients
  //   if (!isClientGM()) {
  //     const element = document.getElementById('weather-toggle');
  //     if (element)
  //       element.style.display = 'none';
  //   } else {
  //     // set the handler
  //     html.find('#weather-toggle').on('click', event => {
  //       event.preventDefault();

  //       const element = document.getElementById('simple-weather-container');
  //       if (element)
  //         element.classList.toggle('showWeather');
  //     });
  //   }
  // }

  // private listenToWeatherRefreshClick(html: JQuery) {
  //   // add the handler
  //   if (isClientGM()) {
  //     html.find('#weather-regenerate').on('click', event => {
  //       event.preventDefault();
  //       this.updateWeather(generate(this.settings, Climate.Cold, Humidity.Barren, Season.Winter, null));
  //     });
  //   } 
  // }

  // // private listenToClimateChange(html: JQuery) {
  // //   const climateSelection = '#climate-selection';

  // //   html.find(climateSelection).on('change', (event) => {
  // //     const target = event.originalEvent?.target as HTMLSelectElement;
  // //     const weatherData = this.weatherGenerator.generate(target?.value as Climates);
  // //     this.updateWeather(weatherData);
  // //   });
  // // }

  // // event handlers
  // private onMouseDownToggleDateFormat(event) {
  //   event.currentTarget.classList.toggle('altFormat');
  // }

  // private onMouseDownStartStopClock(event) {
  //   event.preventDefault();
  //   event = event || window.event;

  //   if (SimpleCalendar.api.isPrimaryGM()) {
  //     if (SimpleCalendar.api.clockStatus().started) {
  //       log(false,'Stopping clock');
  //       SimpleCalendar.api.stopClock();
  //     } else {
  //       log(false,'Starting clock');
  //       SimpleCalendar.api.startClock();
  //     }
  //   }
  // }

  // setup the drag handler for our dialog
  private initializeWindowInteractions($: JQuery) {
    const calendarMoveHandle = $.find('#sweath-window-move-handle');
    const window = $.find('#sweath-container').get(0);
    const windowPosition = this.moduleSettings.getWindowPosition();

    if (!window) return;

    window.style.top = windowPosition.top + 'px';
    window.style.left = windowPosition.left + 'px';

    this.windowDragHandler = new WindowDrag();
    calendarMoveHandle.on('mousedown', () => {
      this.windowDragHandler.start(window, (windowPos: WindowPosition) => {
        this.moduleSettings.setWindowPosition(windowPos);
      });
    });
  }

  // private setClimate(html: JQuery) {
  //   const climateSelection = '#climate-selection';
  //   const climateName = this.weatherTracker.getWeatherData().climate?.name || Climates.temperate;
  //   html.find(climateSelection).val(climateName);
  // }

}
