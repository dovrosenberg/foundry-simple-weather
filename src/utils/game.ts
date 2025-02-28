// some helpers to simplify various repetitive tasks

// is the current client the GM?
const isClientGM = (): boolean => (game.user?.isGM || false);

// localize a string
const localize = (stringId: string): string => game.i18n?.localize('swr.' + stringId) || '';

export { 
  isClientGM,
  localize,
};