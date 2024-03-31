import moduleJson from '@module';

import { log } from '@/utils/log';

import { WeatherDisplay } from '@/applications/WeatherDisplay';
import { WindowPosition } from '@/window/WindowPosition';
import { SettingKeys } from '@/settings/ModuleSettings';
import { WindowDrag } from '@/window/windowDrag';
import { isClientGM } from '@/utils/game';
import { moduleSettings } from '@/settings/ModuleSettings';
import { weatherEffects } from '@/weather/WeatherEffects';

// the solo instance
let weatherApplication: WeatherApplication | WeatherDisplay;

// set the main application; should only be called once
function updateWeatherDisplay(weatherApp: WeatherApplication | WeatherDisplay): void {
  weatherApplication = weatherApp;
}

class WeatherApplication extends Application {
  private _weatherDisplay: WeatherDisplay;
  private _windowID = 'swr-container';
  private _windowDragHandler = new WindowDrag();
  private _windowPosition: WindowPosition;
  private _currentlyHidden = false;  // for toggling... we DO NOT save this state
  private _displayOptions = { dateBox: false, weatherBox: true };

  constructor() {
    super();

    log(false, 'WeatherApplication construction');

    this._weatherDisplay = new WeatherDisplay(this.render);

    // don't show it until ready() has been called
    this._currentlyHidden = true;

    // get default position or set default
    this._windowPosition = moduleSettings.get(SettingKeys.windowPosition) || { left: 100, bottom: 300 }
  }

  // draw the window
  public render(force?: boolean): void {
    this._weatherDisplay.checkSeasonSync();

    super.render(force);
  }

  // window options; called by parent class
  static get defaultOptions() {
    const options = super.defaultOptions;
    
    options.template = `modules/${moduleJson.id}/templates/weather-dialog.hbs`;
    options.popOut = false;  // self-contained window without the extra wrapper
    options.resizable = false;  // window is fixed size

    return options;
  }

  // this provides fields that will be available in the template; called by parent class
  public async getData(): Promise<any> {
    const data = {
      ...(await super.getData()),
      ...(await this._weatherDisplay.getData()),
      windowPosition: this._windowPosition,
      hideDialog: this._currentlyHidden || !(isClientGM() || moduleSettings.get(SettingKeys.dialogDisplay)),  // hide dialog - don't show anything
    };
    //log(false, data);

    return data;
  }

  // call this when either a) foundry loaded and no simple calendar or b) after simple calendar loaded
  // this is needed so that we can properly handle calendar box and sync
  public ready(): void {
    this._weatherDisplay.ready();

    this._currentlyHidden = false;
    this.render(true);
  };

  // move the window
  // we can't use foundry's setPosition() because it doesn't work for fixed size, non popout windows
  public updateWindowPosition(newPosition: WindowPosition) {
    this._windowPosition = newPosition;

    // save
    moduleSettings.set(SettingKeys.windowPosition, this._windowPosition);

    this.render();
  }

  public toggleWindow(): void {
    this._currentlyHidden = !this._currentlyHidden;
    this.render();
  }

  public showWindow(): void {
    this._currentlyHidden = false;
    this.render();
  }

  // called by the parent class to attach event handlers after window is rendered
  // note that saved weather has been reloaded by the time this is called when we're initializing
  // this is called on every render!  One-time functionality should be put in ????? 
  public async activateListeners(html: JQuery<HTMLElement>): Promise<void> {
    await this._weatherDisplay.activateListeners(html);

    // handle window drag
    html.find('#swr-calendar-move-handle').on('mousedown', this.onMoveHandleMouseDown);
    html.find('#swr-weather-move-handle').on('mousedown', this.onMoveHandleMouseDown);

    // setup handlers and values for everyone
    html.find('#swr-weather-box-toggle').on('click', this.onWeatherToggleClick);
    html.find('#swr-date-box-toggle').on('click', this.onDateToggleClick);
    html.find('#swr-close-button').on('click', this.onCloseClick);

    super.activateListeners(html);
  }

  // event handlers - note arrow functions because otherwise 'this' doesn't work
  private onWeatherToggleClick = (event): void => {
    event.preventDefault();

    this._weatherDisplay.updateDisplayOptions({ weatherBox: !this._displayOptions.weatherBox })
  };

  private onDateToggleClick = (event): void => {
    event.preventDefault();

    // if we're turning off, need to move the box right to adjust; reverse for turning on
    if (this._displayOptions.dateBox) 
      this._windowPosition.left += document.getElementById('swr-calendar-box')?.offsetWidth || 0;
    else {
      // little tricker to get width when hidden
      const box = document.getElementById('swr-calendar-box');
      if (box) {
        box.style.visibility = 'hidden';  // use visibility to change display temporarily without flashing
        box.style.display = 'block';
        const width = box.offsetWidth;

        this._windowPosition.left -= width || 0;
      }
    }

    this._weatherDisplay.updateDisplayOptions({ dateBox: !this._displayOptions.dateBox })
  };

  private onCloseClick = (event): void => {
    event.preventDefault();
    this.toggleWindow();   // must be on if we are clicking the button, so this will close it
  }

  private setWindowPosition(position: WindowPosition): void {
    this._windowPosition = position;

    moduleSettings.set(SettingKeys.windowPosition, position);

    this.render();
  }

  private onMoveHandleMouseDown = (event: MouseEvent): void => {
    // only allow drag with left button (also prevents craziness from clicking a button while other is still down)
    if (event.button !== 0)
      return;

    const element = document.getElementById(this._windowID);
    if (element) {
      this._windowDragHandler.start(element, (position: WindowPosition) => {
        // save the new location
        this.setWindowPosition(position);
      });
    }
  };  
}

export {
  weatherApplication,
  WeatherApplication,
  updateWeatherDisplay
}