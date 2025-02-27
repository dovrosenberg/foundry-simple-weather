import { registerCalendarTests } from "./calendar.test";
import { registerGameTests } from "./game.test";

export const registerUtilTests = () => {
  registerCalendarTests();
  registerGameTests();
}