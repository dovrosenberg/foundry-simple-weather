import sinon from 'sinon';
import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { Climate, HexFlowerCell, Humidity, Season } from '@/weather/climateData';
import { Forecast } from '@/weather/Forecast';
import { WeatherData } from '@/weather/WeatherData';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { backupSettings, restoreSettings } from '@test/index';
import { GenerateWeather } from '@/weather/GenerateWeather';
import { getManualOptionsBySeason } from '@/weather/manualWeather';
import { startingCells, } from '@/weather/weatherMap';
import { SimpleCalendarAdapter, SimpleCalendarDate } from '@/calendar';

let resetWeatherMock;  // reset to the 1st call
let dialogMockReturn: boolean = false;   // set this to determine the return value of the dialog prompt 

let weatherStub;
let dialogStub;
let chatMessageStub;

export const registerGenerateWeatherTests = () => {
  // Test suite for when SimpleCalendar is not available
  quench.registerBatch(
    'simple-weather.weather.noSimpleCalendar',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after } = context;
      
      let originalSimpleCalendar: any;
      
      before(() => {
        // clean sinon because we might be testing without SC and so other batches are going to fail
        sinon.restore();
        
        // Store the original SimpleCalendar object if it exists
        if ('SimpleCalendar' in globalThis) {
          originalSimpleCalendar = globalThis.SimpleCalendar;
          // Remove SimpleCalendar completely from globalThis
          delete (globalThis as any).SimpleCalendar;
        }
      });
      
      describe('Weather generation without SimpleCalendar', () => {
        it('should generate weather with null date', async () => {
          // Verify SimpleCalendar is not defined
          expect('SimpleCalendar' in globalThis).to.be.false;
          
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const season = Season.Spring;
          
          // Call the function with null date
          const result = await GenerateWeather.generateWeather(
            climate, 
            humidity, 
            season, 
            null, // null date
            null, 
            false,
            false,
            false // isSingleDayAdvance = false
          );
          
          // Verify the result
          expect(result).to.be.an.instanceOf(WeatherData);
          expect(result.climate).to.equal(climate);
          expect(result.humidity).to.equal(humidity);
          expect(result.season).to.equal(season);
          expect(result.date).to.be.null;
          expect(result.hexFlowerCell).to.be.a('number');
          expect(result.temperature).to.be.a('number');
        });
        
        it('should create manual weather with null date', () => {
          // Verify SimpleCalendar is not defined
          expect('SimpleCalendar' in globalThis).to.be.false;
          
          // Set up test data
          const season = Season.Spring;
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const weatherIndex = 0;
          const temperature = 75;
          
          // Call the function with null date
          const result = GenerateWeather.createManual(
            null, // null date
            season,
            climate,
            humidity,
            temperature,
            weatherIndex
          );
          
          // Verify the result
          expect(result).to.not.be.null;
          expect(result?.date).to.be.null;
          expect(result?.season).to.equal(season);
          expect(result?.climate).to.equal(climate);
          expect(result?.temperature).to.be.a('number');
        });
        
        it('should create specific weather with null date', () => {
          // Verify SimpleCalendar is not defined
          expect('SimpleCalendar' in globalThis).to.be.false;
          
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const hexFlowerCell = 17 as HexFlowerCell;
          
          // Call the function with null date
          const result = GenerateWeather.createSpecificWeather(
            null, // null date
            climate,
            humidity,
            hexFlowerCell
          );
          
          // Verify the result
          expect(result).to.not.be.null;
          expect(result?.date).to.be.null;
          expect(result?.climate).to.equal(climate);
          expect(result?.humidity).to.equal(humidity);
          expect(result?.hexFlowerCell).to.equal(hexFlowerCell);
        });
        
        it('should output weather to chat with null date', () => {
          // Verify SimpleCalendar is not defined
          expect('SimpleCalendar' in globalThis).to.be.false;
          
          // Create a stub for ChatMessage.create
          const chatStub = sinon.stub(ChatMessage, 'create').returns(Promise.resolve({} as ChatMessage));
          
          // Mock ModuleSettings.get
          const getStub = sinon.stub(ModuleSettings, 'get');
          
          // Create a mock for the custom chat messages
          // We'll use a simpler approach by directly mocking the behavior
          getStub.withArgs(ModuleSettingKeys.customChatMessages).callsFake(() => {
            // When accessing customChatMessages[1][1][17], return our test message
            const mockMessages = {
              1: { // Climate.Temperate
                1: { // Humidity.Modest
                  17: "Custom message for testing"
                }
              }
            };
            return mockMessages;
          });
          getStub.withArgs(ModuleSettingKeys.outputDateToChat).returns(true);
          getStub.withArgs(ModuleSettingKeys.publicChat).returns(true);
          getStub.withArgs(ModuleSettingKeys.useCelsius).returns(false);
          
          // Create weather data with null date
          const weatherData = new WeatherData(
            null, // null date
            Season.Spring,
            Humidity.Modest,
            Climate.Temperate,
            17 as HexFlowerCell,
            75
          );
          
          // Call the function
          GenerateWeather.outputWeatherToChat(weatherData);
          
          // Verify ChatMessage.create was called
          expect(chatStub.calledOnce).to.be.true;
          
          // Verify the message doesn't include date information
          const callArgs = chatStub.getCall(0).args[0];
          expect(callArgs.content).to.include(weatherData.getDescription());
          expect(callArgs.content).to.include(weatherData.getTemperature(false));
          expect(callArgs.content).to.include("Custom message for testing");
          
          // Restore stubs
          chatStub.restore();
          getStub.restore();
        });
        
        it('should handle generateForecast with no SimpleCalendar', async () => {
          // Verify SimpleCalendar is not defined
          expect('SimpleCalendar' in globalThis).to.be.false;
          
          // Mock ModuleSettings
          const getStub = sinon.stub(ModuleSettings, 'get');
          const setStub = sinon.stub(ModuleSettings, 'set');
          
          // Mock existing forecasts
          const existingForecasts = {};
          getStub.withArgs(ModuleSettingKeys.forecasts).returns(existingForecasts);
          
          // Create weather data with valid parameters
          const weatherData = new WeatherData(
            null, // null date
            Season.Spring,
            Humidity.Modest,
            Climate.Temperate,
            17 as HexFlowerCell,
            75
          );
          
          // Call generateForecast with a timestamp (which will be ignored due to SimpleCalendar being null)
          const result = await GenerateWeather.generateForecast(12345, weatherData, false);
          
          // Verify the result is an empty object
          expect(Object.keys(result).length).to.equal(0);
          
          // Verify ModuleSettings.set was not called (no changes to save)
          expect(setStub.called).to.be.false;
          
          // Restore stubs
          getStub.restore();
          setStub.restore();
        });
      });
      
      after(() => {
        // Restore the original SimpleCalendar object if it existed
        if (originalSimpleCalendar) {
          (globalThis as any).SimpleCalendar = originalSimpleCalendar;
        }
      });
    }
  );
  
  quench.registerBatch(
    'simple-weather.weather.forecastGeneration',
    (context: QuenchBatchContext) => {
      const { describe, it, expect, before, after, } = context;
      const todayTimestamp = SimpleCalendar.api.dateToTimestamp({
        day: 14,
        month: 3,
        year: 2001,
      });
      const todayDate = new SimpleCalendarAdapter().timestampToDate(todayTimestamp);

      if (!todayTimestamp) throw new Error('could not generate test date');

      const weather: WeatherData[] = [
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 17, 70),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 18, 71),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 16, 72),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 17, 73),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 12, 74),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 19, 75),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 18, 76),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 16, 77),
        new WeatherData(todayDate, Season.Spring, Humidity.Modest, Climate.Temperate, 17, 78),
      ];

      const forecasts: Record<string, Forecast> = {};
      const REFORECAST_OFFSET = 4;
      const reforecasts: Record<string, Forecast> = {};   // the forecasts that will be generated with the next 7 calls fo generateWeather
      for (let i = 0; i < 7; i++) {
        const timestamp = SimpleCalendar.api.dateToTimestamp({
          day: 15+i,
          month: 3,
          year: 2001, 
        });
        forecasts[timestamp] = new Forecast(timestamp, Climate.Temperate, Humidity.Modest, weather[i].hexFlowerCell as HexFlowerCell); 
        reforecasts[timestamp] = new Forecast(timestamp, Climate.Temperate, Humidity.Modest, weather[(i+REFORECAST_OFFSET) % weather.length].hexFlowerCell as HexFlowerCell); 
      }
        

      before(async () => {
        backupSettings();

        // mock generateWeather for testing forecasts
        let callCount = 0;
        resetWeatherMock = () => { callCount = 0;}
        weatherStub = sinon.stub(GenerateWeather, 'generateWeather').callsFake(
          async (_climate: Climate, _humidity: Humidity, _season: Season, today: SimpleCalendarDate | null, _yesterday: WeatherData | null, _forForecast = false, _forceRegenerate = false, _isSingleDayAdvance = false): Promise<WeatherData> => {
            // update the date -- we start midway through the set to make sure they don't align with forecasts
            const weatherToReturn = weather[(REFORECAST_OFFSET + callCount++) % weather.length];
            weatherToReturn.date = today;
            return weatherToReturn;
          }
        );

        // mock for dialog prompt
        dialogStub = sinon.stub(Dialog, 'confirm').callsFake(() => dialogMockReturn);
        
        // Mock ChatMessage.create for outputWeatherToChat tests
        chatMessageStub = sinon.stub(ChatMessage, 'create').returns(Promise.resolve({} as ChatMessage));
      });

      beforeEach(async () => {
        resetWeatherMock();
        chatMessageStub.resetHistory();
        dialogStub.resetHistory();
      });

      describe('generateForecast', () => {
        it('should do nothing if todayWeather.climate/humidity/season are null', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);

          // test with a force overwrite so we can see if they change
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, null, Humidity.Modest, Climate.Temperate, 14, 14), false);
          expect(ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, null, Climate.Temperate, 14, 14), false);
          expect(ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, null, 14, 14), false);
          expect(ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(forecasts);
        });

        it('should generate forecasts for the next 7 days', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, {});
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), false);
          expect(ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(reforecasts);
        });

        it('should overwrite if extendOnly==false', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), false);
          expect(ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(reforecasts);
        });

        it('should NOT prompt about overwrite when extendOnly set to true (new behavior)', async () => {
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);  // make sure there are forecasts
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), true);
          // With the new logic, extendOnly=true should never prompt
          expect(dialogStub.called).to.be.false;
        });

        it('should only fill in missing days when extendOnly==true (no prompting)', async () => {
          // Note: With new logic, extendOnly never prompts, so dialogMockReturn is irrelevant
          
          const holeyForecasts = {...forecasts};
          const timestampToRemove = SimpleCalendar.api.dateToTimestamp({
            day: 15+3,
            month: 3,
            year: 2001, 
          });
  
          // remove a forecast
          delete holeyForecasts[timestampToRemove];
          await ModuleSettings.set(ModuleSettingKeys.forecasts, holeyForecasts);  

          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), true);

          // fill back in the forecast (with the 1st weather used)
          holeyForecasts[timestampToRemove] = new Forecast(timestampToRemove, Climate.Temperate, Humidity.Modest, weather[REFORECAST_OFFSET].hexFlowerCell as HexFlowerCell); 
          expect(ModuleSettings.get(ModuleSettingKeys.forecasts)).to.deep.equal(holeyForecasts);          
          
          // Verify no prompting occurred
          expect(dialogStub.called).to.be.false;
        });

        it('should extend to day 8 when all 7 days exist and extendOnly==true', async () => {
          // With new logic, if all 7 days exist, extendOnly adds day 8
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);  
          await GenerateWeather.generateForecast(todayTimestamp, new WeatherData(todayDate, Season.Fall, Humidity.Modest, Climate.Temperate, 14, 14), true);

          // Get the updated forecasts
          const updatedForecasts = ModuleSettings.get(ModuleSettingKeys.forecasts);
          
          // Should have all original forecasts plus day 8
          expect(Object.keys(updatedForecasts)).to.have.length(8);
          
          // Day 8 should be the 8th day from today
          const day8Timestamp = SimpleCalendar.api.dateToTimestamp({
            day: 15+8,
            month: 3,
            year: 2001, 
          });
          expect(updatedForecasts[day8Timestamp]).to.exist;
          
          // Verify no prompting occurred
          expect(dialogStub.called).to.be.false;
        });
      });
      
      describe('generateWeather', () => {
        // Restore the original generateWeather for these tests
        beforeEach(() => {
          weatherStub.restore();
        });
        
        // Re-stub after each test
        afterEach(() => {
          let callCount = 0;
          weatherStub = sinon.stub(GenerateWeather, 'generateWeather').callsFake(
            async (_climate: Climate, _humidity: Humidity, _season: Season, today: SimpleCalendarDate | null, _yesterday: WeatherData | null, _forForecast = false, _forceRegenerate = false, _isSingleDayAdvance = false): Promise<WeatherData> => {
              const weatherToReturn = weather[(REFORECAST_OFFSET + callCount++) % weather.length];
              weatherToReturn.date = today;
              return weatherToReturn;
            }
          );
        });
        
        it('should generate weather with valid parameters', async () => {
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const season = Season.Spring;
          
          // Call the function
          const result = await GenerateWeather.generateWeather(
            climate, 
            humidity, 
            season, 
            todayDate, 
            null, // no yesterday data
            false,
            false,
            false // isSingleDayAdvance = false
          );
          
          // Verify the result
          expect(result).to.be.an.instanceOf(WeatherData);
          expect(result.climate).to.equal(climate);
          expect(result.humidity).to.equal(humidity);
          expect(result.season).to.equal(season);
          expect(result.date).to.equal(todayDate);
          expect(result.hexFlowerCell).to.be.a('number');
          expect(result.temperature).to.be.a('number');
        });
        
        it('should use extendOnly mode when isSingleDayAdvance is true', async () => {
          // Stub generateForecast to track how it's called
          const generateForecastStub = sinon.stub(GenerateWeather, 'generateForecast').resolves({});
          
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const season = Season.Spring;
          
          // Enable forecasts
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, true);
          
          // Call the function with isSingleDayAdvance = true
          await GenerateWeather.generateWeather(
            climate, 
            humidity, 
            season, 
            todayDate, 
            null, // no yesterday data
            false,
            false,
            true // isSingleDayAdvance = true
          );
          
          // Verify generateForecast was called with extendOnly = true
          expect(generateForecastStub.calledOnce).to.be.true;
          expect(generateForecastStub.firstCall.args[2]).to.be.true; // extendOnly parameter
          
          // Clean up
          generateForecastStub.restore();
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, false);
        });
        
        it('should use overwrite mode when isSingleDayAdvance is false', async () => {
          // Stub generateForecast to track how it's called
          const generateForecastStub = sinon.stub(GenerateWeather, 'generateForecast').resolves({});
          
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const season = Season.Spring;
          
          // Enable forecasts
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, true);
          
          // Call the function with isSingleDayAdvance = false
          await GenerateWeather.generateWeather(
            climate, 
            humidity, 
            season, 
            todayDate, 
            null, // no yesterday data
            false,
            false,
            false // isSingleDayAdvance = false
          );
          
          // Verify generateForecast was called with extendOnly = false
          expect(generateForecastStub.calledOnce).to.be.true;
          expect(generateForecastStub.firstCall.args[2]).to.be.false; // extendOnly parameter
          
          // Clean up
          generateForecastStub.restore();
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, false);
        });
        
        it('should use existing forecast when available', async () => {
          // Set up a forecast for today
          const forecastCell = 15; // specific hex cell for testing
          const forecasts = {
            [todayTimestamp]: new Forecast(todayTimestamp, Climate.Temperate, Humidity.Modest, forecastCell as HexFlowerCell)
          };
          
          // Set the module settings
          await ModuleSettings.set(ModuleSettingKeys.forecasts, forecasts);
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, true);
          
          // Call the function
          const result = await GenerateWeather.generateWeather(
            Climate.Temperate,
            Humidity.Modest,
            Season.Spring,
            todayDate,
            null,
            false,
            false,
            false // isSingleDayAdvance = false
          );
          
          // Verify it used the forecast
          expect(result.hexFlowerCell).to.equal(forecastCell);
          
          // Restore settings
          await ModuleSettings.set(ModuleSettingKeys.forecasts, {});
        });
        
        it('should handle season change correctly', async () => {
          // Create yesterday's weather in a different season
          const yesterdayWeather = new WeatherData(
            todayDate, 
            Season.Winter, // different season
            Humidity.Modest, 
            Climate.Temperate, 
            12, // some hex cell
            32
          );
          
          // Call the function with season change
          const result = await GenerateWeather.generateWeather(
            Climate.Temperate,
            Humidity.Modest,
            Season.Spring, // changed to spring
            todayDate,
            yesterdayWeather,
            false,
            false,
            false // isSingleDayAdvance = false
          );
          
          // Verify it picked a new starting cell for the new season
          expect(result.hexFlowerCell).to.be.a('number');
          expect(startingCells[Season.Spring]).to.include(result.hexFlowerCell);
        });
        
        it('should not generate forecasts when forForecast is true regardless of isSingleDayAdvance', async () => {
          // Stub generateForecast to track if it's called
          const generateForecastStub = sinon.stub(GenerateWeather, 'generateForecast').resolves({});
          
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const season = Season.Spring;
          
          // Enable forecasts
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, true);
          
          // Call the function with forForecast = true and isSingleDayAdvance = true
          await GenerateWeather.generateWeather(
            climate, 
            humidity, 
            season, 
            todayDate, 
            null, // no yesterday data
            true, // forForecast = true
            false,
            true // isSingleDayAdvance = true
          );
          
          // Verify generateForecast was NOT called
          expect(generateForecastStub.called).to.be.false;
          
          // Clean up
          generateForecastStub.restore();
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, false);
        });
        
        it('should test complete forecast extension flow for single day advance', async () => {
          // This test simulates the complete flow when date advances by one day
          const generateForecastStub = sinon.stub(GenerateWeather, 'generateForecast').resolves({});
          
          // Enable forecasts
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, true);
          
          // Simulate normal weather generation with single day advance
          await GenerateWeather.generateWeather(
            Climate.Temperate,
            Humidity.Modest,
            Season.Spring,
            todayDate,
            null, // no yesterday data
            false, // not forForecast
            false, // not forceRegenerate
            true // isSingleDayAdvance = true
          );
          
          // Verify generateForecast was called with extendOnly = true
          expect(generateForecastStub.calledOnce).to.be.true;
          expect(generateForecastStub.firstCall.args[2]).to.be.true; // extendOnly parameter
          
          // Clean up
          generateForecastStub.restore();
          await ModuleSettings.set(ModuleSettingKeys.useForecasts, false);
        });
      });
      
      describe('createManual', () => {
        it('should create manual weather with valid parameters', () => {
          // Get valid manual options for the test
          const season = Season.Spring;
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const manualOptions = getManualOptionsBySeason(season, climate, humidity);
          
          // Use the first option for testing
          const weatherIndex = 0;
          const temperature = 75;
          
          // Call the function
          const result = GenerateWeather.createManual(
            todayDate,
            season,
            climate,
            humidity,
            temperature,
            weatherIndex
          );
          
          // Verify the result
          expect(result).to.not.be.null;
          expect(result?.season).to.equal(season);
          expect(result?.climate).to.equal(manualOptions[weatherIndex].weather.climate);
          expect(result?.humidity).to.equal(manualOptions[weatherIndex].weather.humidity);
          expect(result?.hexFlowerCell).to.equal(manualOptions[weatherIndex].weather.hexCell);
          expect(result?.temperature).to.be.a('number');
          // Temperature should be close to the provided value (with random variation)
          expect(result?.temperature).to.be.closeTo(temperature, 5);
        });
        
        it('should return null with invalid parameters', () => {
          // Test with invalid weather index
          const result = GenerateWeather.createManual(
            todayDate,
            Season.Spring,
            Climate.Temperate,
            Humidity.Modest,
            75,
            999 // Invalid index
          );
          
          // Verify it returns null
          expect(result).to.be.null;
        });
      });
      
      describe('createSpecificWeather', () => {
        it('should create specific weather with valid parameters', () => {
          // Set up test data
          const climate = Climate.Temperate;
          const humidity = Humidity.Modest;
          const hexFlowerCell = 17 as HexFlowerCell;
          
          // Call the function
          const result = GenerateWeather.createSpecificWeather(
            todayDate,
            climate,
            humidity,
            hexFlowerCell
          );
          
          // Verify the result
          expect(result).to.not.be.null;
          expect(result?.climate).to.equal(climate);
          expect(result?.humidity).to.equal(humidity);
          expect(result?.hexFlowerCell).to.equal(hexFlowerCell);
          expect(result?.temperature).to.be.a('number');
          expect(result?.manualOnly).to.be.true;
        });
        
        it('should throw error with invalid parameters', () => {
          // Test with invalid hex cell
          expect(() => {
            GenerateWeather.createSpecificWeather(
              todayDate,
              Climate.Temperate,
              Humidity.Modest,
              99 as HexFlowerCell // Invalid cell
            );
          }).to.throw(Error);
        });
      });
      
      describe('outputWeatherToChat', () => {
        it('should output weather to chat correctly', async () => {
          // Set up test data
          const weatherData = new WeatherData(
            todayDate,
            Season.Spring,
            Humidity.Modest,
            Climate.Temperate,
            17 as HexFlowerCell,
            75
          );
          
          // Mock the ModuleSettings.get method to return our custom values
          const getStub = sinon.stub(ModuleSettings, 'get');
          getStub.withArgs(ModuleSettingKeys.customChatMessages).returns([[[{}]], [[{}, { 17: "Custom message for testing" }]], [[{}]]]);
          getStub.withArgs(ModuleSettingKeys.outputDateToChat).returns(true);
          getStub.withArgs(ModuleSettingKeys.publicChat).returns(true);
          
          // Call the function
          GenerateWeather.outputWeatherToChat(weatherData);
          
          // Verify ChatMessage.create was called with correct parameters
          expect(chatMessageStub.calledOnce).to.be.true;
          
          const callArgs = chatMessageStub.getCall(0).args[0];
          expect(callArgs.content).to.include(weatherData.getDescription());
          expect(callArgs.content).to.include(weatherData.getTemperature(false));
          expect(callArgs.content).to.include("Custom message for testing");
          
          // Restore the original get method
          getStub.restore();
        });
      });

      after(async () => {
        await restoreSettings();

        // clear mocks
        sinon.restore();      
      });
    }
  )
};
