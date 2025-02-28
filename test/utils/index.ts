import { registerCalendarTests } from "./calendar.test";
import { registerGameTests } from "./game.test";
import { registerMigrationTests } from './migration.test';

export const registerUtilTests = () => {
  registerCalendarTests();
  registerGameTests();
  registerMigrationTests();
}