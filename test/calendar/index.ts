import { registerCalendarAdapterTests, registerAdapterSpecificTests } from './adapters.test';
import { registerCalendarManagerTests } from './manager.test';

export const registerCalendarTests = () => {
  registerCalendarAdapterTests();
  registerAdapterSpecificTests();
  registerCalendarManagerTests();
};
