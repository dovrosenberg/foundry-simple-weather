import type { SimpleCalendar } from 'foundryvtt-simple-calendar';
export * from '@types/fvtt-types';
import 'foundryvtt-simple-calendar';

declare let SimpleCalendar: SimpleCalendar;

declare global {
  interface AssumeHookRan {
    ready: never; // this ensures that `game` is never undefined (at least from a typescript standpoint)... avoids needing to continually typeguard
  }

  type foundry = _foundry;

  interface LenientGlobalVariableTypes {
    game: never;
    quench: never;
  }
}