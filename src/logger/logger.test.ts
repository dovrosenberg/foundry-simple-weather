import { Log } from './logger';
import { LogLevel } from './logLevel';

const MESSAGE = 'This is a message to be logged';

describe('Logger', () => {
  let log: Log;
  let messageWithPrefix: string;
  let originalInfo;
  let originalError;
  let originalDebug;
  let originalWarn;
  let originalLog;

  beforeAll(() => {
    originalInfo = console.info;
    originalError = console.error;
    originalDebug = console.debug;
    originalWarn = console.warn;
    originalLog = console.log;
  });

  beforeEach(() => {
    log = new Log();
    messageWithPrefix = log['messagePrefix'] + MESSAGE;

    console.info = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.info = originalInfo;
    console.error = originalError;
    console.debug = originalDebug;
    console.warn = originalWarn;
    console.log = originalLog;
  });

  it('SHOULD no logs in console when LogLevel is set to none', () => {
    givenAConfiguredLogLevelOf(LogLevel.NONE);

    callAllLoggingMethodsWithMessage(MESSAGE);

    expect(console.info).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('SHOULD print appropriate logs in console when LogLevel is set to info', () => {
    givenAConfiguredLogLevelOf(LogLevel.INFO);

    callAllLoggingMethodsWithMessage(MESSAGE);

    expect(console.info).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.error).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('SHOULD print appropriate logs in console when LogLevel is set to error', () => {
    givenAConfiguredLogLevelOf(LogLevel.ERROR);

    callAllLoggingMethodsWithMessage(MESSAGE);

    expect(console.info).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.error).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('SHOULD print appropriate logs in console when LogLevel is set to debug', () => {
    givenAConfiguredLogLevelOf(LogLevel.DEBUG);

    callAllLoggingMethodsWithMessage(MESSAGE);

    expect(console.info).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.error).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.debug).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('SHOULD print appropriate logs in console when LogLevel is set to warn', () => {
    givenAConfiguredLogLevelOf(LogLevel.WARN);

    callAllLoggingMethodsWithMessage(MESSAGE);

    expect(console.info).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.error).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.debug).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.warn).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.log).not.toHaveBeenCalled();
  });

  it('SHOULD print appropriate logs in console when LogLevel is set to all', () => {
    givenAConfiguredLogLevelOf(LogLevel.ALL);

    callAllLoggingMethodsWithMessage(MESSAGE);

    expect(console.info).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.error).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.debug).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.warn).toHaveBeenCalledWith(messageWithPrefix);
    expect(console.log).toHaveBeenCalledWith(messageWithPrefix);
  });

  function givenAConfiguredLogLevelOf(level: LogLevel) {
    log.registerLevelCheckCallback(() => level);
  }

  function callAllLoggingMethodsWithMessage(message: string) {
    log.info(message);
    log.error(message);
    log.debug(message);
    log.warn(message);
    log.log(message);
  }
});
