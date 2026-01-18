import { registerCalendarAdapterTests } from './adapters.test';
import { registerCalendarManagerTests } from './manager.test';

export const registerCalendarTests = () => {
  registerCalendarAdapterTests();
  registerCalendarManagerTests();
};
