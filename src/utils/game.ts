// some helpers to simplify various repetitive tasks

// return the game object
export function getGame(): Game {
  if(!(game instanceof Game)) {
    throw new Error('Game is not initialized yet!');
  }
  return game;
}

// is the current client the GM?
export function isClientGM(): boolean {
  return getGame()?.user?.isGM || false;
}

// localize a string
export const localize = (stringId: string) => getGame().i18n.localize(stringId);