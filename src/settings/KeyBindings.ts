import { getGame } from '@/utils/game';
import { weatherApplication } from '@/applications/WeatherApplication';
import moduleJson from '@module';

export enum KeyBindingKeys {
  toggleMainApp = 'toggleMainApp',   // open/close window
  regenerate = 'regenerate',    // regenerate weather
  manualPause = 'manualPause',   // turn on manual pause
  pauseFX = 'pauseFX',    // pause weather effects
}

export class KeyBindings {
  public static register() {
    const keybindings = [
      {
        bindingId: KeyBindingKeys.toggleMainApp,
        name: "swr.keybindings.toggle",
        hint: "swr.keybindings.toggleHelp",
        onDown: weatherApplication.toggleWindow.bind(weatherApplication),
        editable: [],
      },
      {
        bindingId: KeyBindingKeys.regenerate,
        name: "swr.keybindings.regenerate",
        hint: "swr.keybindings.regenerateHelp",
        onDown: weatherApplication.regenerateWeather.bind(weatherApplication),
        editable: [],
      },
      {
        bindingId: KeyBindingKeys.manualPause,
        name: "swr.keybindings.manualPause",
        hint: "swr.keybindings.manualPauseHelp",
        onDown: weatherApplication.manualPauseToggle.bind(weatherApplication),
        editable: [],
      },
      {
        bindingId: KeyBindingKeys.pauseFX,
        name: "swr.keybindings.pauseFX",
        hint: "swr.keybindings.pauseFXHelp",
        onDown: weatherApplication.toggleFX.bind(weatherApplication),
        editable: [],
      },
    ];

    for (let i=0; i<keybindings.length; i++) {
      const binding = keybindings[i];

      getGame().keybindings.register(moduleJson.id, binding.bindingId, {
        name: binding.name,
        hint: binding.hint,
        onDown: binding.onDown,
        editable: binding.editable,
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
      });
    }
  }
}