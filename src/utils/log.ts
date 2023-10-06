import { getGame } from '@/utils/game';

const messagePrefix = 'simple-weather | ';

// log the given text, so long as our current log level is at least the one given
export function log(force: boolean, ...args): void {
  try {
    const isDebugging = getGame().modules.get('_dev-mode')?.api?.getPackageDebugValue('simple-weather') || false;

    if (force || isDebugging) {
      console.log(messagePrefix, ...args);
    }
  } catch (e) {
    // eslint-ignore-next-line
  }
}


