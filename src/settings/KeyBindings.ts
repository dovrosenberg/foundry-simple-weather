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
        name: "sweath.keybindings.toggle",  // localized by Foundry
        hint: "sweath.keybindings.toggleHelp", // localized by Foundry
        onDown: weatherApplication.toggleWindow.bind(weatherApplication),
        editable: [],
      },
      {
        bindingId: KeyBindingKeys.regenerate,
        name: "sweath.keybindings.regenerate", // localized by Foundry
        hint: "sweath.keybindings.regenerateHelp", // localized by Foundry
        onDown: weatherApplication.regenerateWeather.bind(weatherApplication),
        editable: [],
      },
      {
        bindingId: KeyBindingKeys.manualPause,
        name: "sweath.keybindings.manualPause", // localized by Foundry
        hint: "sweath.keybindings.manualPauseHelp", // localized by Foundry
        onDown: weatherApplication.manualPauseToggle.bind(weatherApplication),
        editable: [],
      },
      {
        bindingId: KeyBindingKeys.pauseFX,
        name: "sweath.keybindings.pauseFX", // localized by Foundry
        hint: "sweath.keybindings.pauseFXHelp", // localized by Foundry
        onDown: weatherApplication.toggleFX.bind(weatherApplication),
        editable: [],
      },
    ];

    for (let i=0; i<keybindings.length; i++) {
      const binding = keybindings[i];

      game.keybindings.register(moduleJson.id, binding.bindingId, {
        name: binding.name,
        hint: binding.hint,
        onDown: binding.onDown,
        editable: binding.editable,
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
      });
    }
  }
}