// some helpers to simplify various repetitive tasks

import { moduleSettings, SettingKeys } from '@/settings/ModuleSettings';

// return the game object
const getGame = function(): Game {
  if(!(game instanceof Game)) {
    throw new Error('Game is not initialized yet!');
  }
  return game;
}

// is the current client the GM (or treated that way?
const isClientGM = (): boolean => (getGame()?.user?.isGM || false);

// is the current client the GM (or treated that way?
const hasControlPermission = (): boolean => (isClientGM() || (moduleSettings.get(SettingKeys.trustedPlayerAsGM) && getGame()?.user?.isTrusted) || false);

// localize a string
const localize = (stringId: string) => getGame().i18n.localize(stringId);

export { 
  getGame,
  isClientGM,
  hasControlPermission,
  localize,
};