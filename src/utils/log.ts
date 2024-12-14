import { getGame } from '@/utils/game';
import { id as ModuleId } from '@module';

const messagePrefix = `${moduleId} | `;

// log the given text, so long as our current log level is at least the one given
export function log(force: boolean, ...args): void {
  try {
    const isDebugging = getGame().modules.get('_dev-mode')?.api?.getPackageDebugValue(moduleId) || false;

    if (force || isDebugging) {
      console.log(messagePrefix, ...args);
    }
  } catch (e) {
    // eslint-ignore-next-line
    console.log('ERROR IN LOG FUNCTION:' + e);
  }
}


