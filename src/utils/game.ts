// some helpers to simplify various repetitive tasks

// is the current client the GM?
const isClientGM = (): boolean => (game.user?.isGM || false);

// localize a string
const localize = (stringId: string) => game.i18n?.localize('sweath.' + stringId);

export { 
  isClientGM,
  localize,
};