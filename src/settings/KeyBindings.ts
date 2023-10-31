import { getGame } from '@/utils/game';
import { weatherApplication } from '@/applications/WeatherApplication';
import moduleJson from '@module';

export enum KeyBindingKeys {
  toggleMainApp = 'toggleMainApp',   // open/close window
  regenerate = 'regenerate',    // regenerate weather
  manualPause = 'manualPause',   // turn on manual pause
  pauseFX = 'pauseFX',    // pause weather effects
}

export default class KeyBindings {
  public static register() {
    const keybindings = [
      {
        bindingId: KeyBindingKeys.toggleMainApp,
        name: "sweath.keybindings.toggle",
        hint: "sweath.keybindings.toggleHint",
        onDown: weatherApplication.toggleWindow(),
        // default: {
        //   key: "",
        //   modifiers: []
        // }
      },
      {
        bindingId: KeyBindingKeys.regenerate,
        name: "sweath.keybindings.regenerate",
        hint: "sweath.keybindings.regenerateHint",
        onDown: weatherApplication.toggleWindow(),
        default: {
          key: 'KeyR',
          modifiers: ['shift', 'control']
        }
      },
      {
        bindingId: KeyBindingKeys.manualPause,
        name: "sweath.keybindings.manualPause",
        hint: "sweath.keybindings.manualPauseHint",
        onDown: weatherApplication.toggleWindow(),
        // default: {
        //   key: "",
        //   modifiers: []
        // }
      },
      {
        bindingId: KeyBindingKeys.pauseFX,
        name: "sweath.keybindings.pauseFX",
        hint: "sweath.keybindings.pauseFXHint",
        onDown: weatherApplication.toggleWindow(),
        // default: {
        //   key: "",
        //   modifiers: []
        // }
      },
    ];

    for (let i=0; i<keybindings.length; i++) {
      const binding = keybindings[i];

      // note: keybindings is newer than typescript for game
      getGame.keybindings.register(moduleJson.id, binding.bindingId, {
        name: binding.name,
        hint: binding.hint,
        editable: (binding.default) ? [binding.default] : [],
        onDown: binding.onDown,
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });
  }
  }
}