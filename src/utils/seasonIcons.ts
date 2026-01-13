import { Season } from '@/weather/climateData';

// Season icon constants - for Simple Calendar and SC Reborn, we figure out the season from the icon
export const SeasonIcons = {
  Fall: 'fas fa-leaf',
  Winter: 'fas fa-snowflake',
  Spring: 'fas fa-seedling',
  Summer: 'fas fa-sun'
} as const;

// Map from icon classes to season enum values
export const IconToSeasonMap: Record<string, Season> = {
  'fas fa-leaf': Season.Fall,
  'fas fa-snowflake': Season.Winter,
  'fas fa-seedling': Season.Spring,
  'fas fa-sun': Season.Summer
};
