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


  private testvalue = 0;

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
  public async getData(): Promise<any> {
    log(false, 'GETDATA called');

    const data = {
      ...(await super.getData()),
      isGM: isClientGM(),
      testvalue: this.testvalue,
    }

    return data;
  }

  // called by the parent class to attach event handlers
  public activateListeners(html: JQuery<HTMLElement>) {
    this.renderCompleteCallback();

    // get window in right place
    this.initializeWindowInteractions(html);

    const dateFormatToggle = '#date-display';
    // const startStopClock = '#start-stop-clock';

    // toggle date format when the date is clicked
    html.find(dateFormatToggle).on('mousedown', event => {
      event.currentTarget.classList.toggle('altFormat');
      this.testvalue++;
      this.render();
    });

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

    // this is important, as it is what triggers refreshes when data changes
    super.activateListeners(html);
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

  // event handlers
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

  // place the window correctly and setup the drag handler for our dialog
  private initializeWindowInteractions($: JQuery<HTMLElement>) {
    const calendarMoveHandle = document.getElementById('sweath-window-move-handle');
    const weatherWindow = document.getElementById('sweath-container');
    const windowPosition = this.moduleSettings.getWindowPosition();

    if (!weatherWindow) return;

    weatherWindow.style.top = windowPosition.top + 'px';
    weatherWindow.style.left = windowPosition.left + 'px';

    this.windowDragHandler = new WindowDrag();
    $.find('#sweath-window-move-handle').on('mousedown', () => {
      this.windowDragHandler.start(weatherWindow, (windowPos: WindowPosition) => {
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
