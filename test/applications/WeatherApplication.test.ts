import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { WeatherApplication } from '../../src/applications/WeatherApplication';
import { expect } from 'chai';
import { WeatherData } from '../../src/weather/WeatherData';
import { Season, Humidity, Climate } from '../../src/weather/climateData';

export const registerWeatherApplicationTests = (context: QuenchBatchContext) => {
  const { describe, it, beforeEach, afterEach } = context;
  
  describe('WeatherApplication', () => {
    let weatherApp: WeatherApplication;
    
    beforeEach(() => {
      // Create a new WeatherApplication instance for each test
      weatherApp = new WeatherApplication();
    });
    
    afterEach(() => {
      // Clean up after each test
    });
    
    describe('isOneDayAdvance', () => {
      it('should return true for normal day advance', () => {
        const previous = {
          year: 2024,
          month: 1,
          day: 15,
          minute: 0,
          hour: 12,
          weekday: 'Sun',
          display: { date: '1/15/2024', time: '12:00' },
          season: 1
        };
        
        const current = {
          year: 2024,
          month: 1,
          day: 16,
          minute: 0,
          hour: 12,
          weekday: 'Mon',
          display: { date: '1/16/2024', time: '12:00' },
          season: 1
        };
        
        // Set up the current weather with the previous date
        (weatherApp as any)._currentWeather = new WeatherData(previous, Season.Spring, Humidity.Modest, Climate.Temperate, 14, 70);
        
        // Access the private method using bracket notation
        const result = (weatherApp as any).isOneDayAdvance(current);
        expect(result).to.be.true;
      });
      
      it('should return false for same day', () => {
        const date = {
          year: 2024,
          month: 1,
          day: 15,
          minute: 0,
          hour: 12,
          weekday: 'Sun',
          display: { date: '1/15/2024', time: '12:00' },
          season: 1
        };
        
        // Set up the current weather with the same date
        (weatherApp as any)._currentWeather = new WeatherData(date, Season.Spring, Humidity.Modest, Climate.Temperate, 14, 70);
        
        const result = (weatherApp as any).isOneDayAdvance(date);
        expect(result).to.be.false;
      });
      
      it('should return false for multiple day jump', () => {
        const previous = {
          year: 2024,
          month: 1,
          day: 15,
          minute: 0,
          hour: 12,
          weekday: 'Sun',
          display: { date: '1/15/2024', time: '12:00' },
          season: 1
        };
        
        const current = {
          year: 2024,
          month: 1,
          day: 20,
          minute: 0,
          hour: 12,
          weekday: 'Sat',
          display: { date: '1/20/2024', time: '12:00' },
          season: 1
        };
        
        (weatherApp as any)._currentWeather = new WeatherData(previous, Season.Spring, Humidity.Modest, Climate.Temperate, 14, 70);
        
        const result = (weatherApp as any).isOneDayAdvance(current);
        expect(result).to.be.false;
      });
      
      it('should return true for month transition', () => {
        const previous = {
          year: 2024,
          month: 1,
          day: 31,
          minute: 0,
          hour: 12,
          weekday: 'Wed',
          display: { date: '1/31/2024', time: '12:00' },
          season: 1
        };
        
        const current = {
          year: 2024,
          month: 2,
          day: 1,
          minute: 0,
          hour: 12,
          weekday: 'Thu',
          display: { date: '2/1/2024', time: '12:00' },
          season: 2
        };
        
        (weatherApp as any)._currentWeather = new WeatherData(previous, Season.Spring, Humidity.Modest, Climate.Temperate, 14, 70);
        
        const result = (weatherApp as any).isOneDayAdvance(current);
        expect(result).to.be.true;
      });
      
      it('should return true for year transition', () => {
        const previous = {
          year: 2023,
          month: 12,
          day: 31,
          minute: 0,
          hour: 12,
          weekday: 'Sun',
          display: { date: '12/31/2023', time: '12:00' },
          season: 4
        };
        
        const current = {
          year: 2024,
          month: 1,
          day: 1,
          minute: 0,
          hour: 12,
          weekday: 'Mon',
          display: { date: '1/1/2024', time: '12:00' },
          season: 1
        };
        
        (weatherApp as any)._currentWeather = new WeatherData(previous, Season.Winter, Humidity.Modest, Climate.Temperate, 14, 70);
        
        const result = (weatherApp as any).isOneDayAdvance(current);
        expect(result).to.be.true;
      });
      
      it('should return false when no previous date', () => {
        const current = {
          year: 2024,
          month: 1,
          day: 16,
          minute: 0,
          hour: 12,
          weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          display: { date: { day: 16, month: 1, year: 2024 }, time: '12:00' },
          currentSeason: { numericRepresentation: 1 }
        };
        
        // No previous weather set
        (weatherApp as any)._currentWeather = null;
        
        const result = (weatherApp as any).isOneDayAdvance(current);
        expect(result).to.be.false;
      });
      
      it('should return false for invalid current date', () => {
        const previous = {
          year: 2024,
          month: 1,
          day: 15,
          minute: 0,
          hour: 12,
          weekday: 'Sun',
          display: { date: '1/15/2024', time: '12:00' },
          season: 1
        };
        
        const current = {
          year: 2024,
          month: 1,
          // Missing day
          minute: 0,
          hour: 12,
          weekday: 'Mon',
          display: { date: '1/16/2024', time: '12:00' },
          season: 1
        };
        
        (weatherApp as any)._currentWeather = new WeatherData(previous, Season.Spring, Humidity.Modest, Climate.Temperate, 14, 70);
        
        const result = (weatherApp as any).isOneDayAdvance(current);
        expect(result).to.be.false;
      });
    });
  });
};
