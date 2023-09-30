import moduleJson from '@module';

import { LogLevel } from './logLevel';

export class Log {
  private messagePrefix = moduleJson.title + ' | ';
  private checkLevel: () => boolean | LogLevel = () => LogLevel.ERROR;

  public registerLevelCheckCallback(callback: () => boolean | LogLevel) {
    this.checkLevel = callback;
  }

  public info(message: any, ...optionalParams: any[]): void {
    if (this.checkLevel() >= LogLevel.INFO) {
      console.info(this.messagePrefix + message, ...optionalParams);
    }
  }

  public error(message: any, ...optionalParams: any[]): void {
    if (this.checkLevel() >= LogLevel.ERROR) {
      console.error(this.messagePrefix + message, ...optionalParams);
    }
  }

  public debug(message: any, ...optionalParams: any[]): void {
    if (this.checkLevel() >= LogLevel.DEBUG) {
      console.debug(this.messagePrefix + message, ...optionalParams);
    }
  }

  public warn(message: any, ...optionalParams: any[]): void {
    if (this.checkLevel() >= LogLevel.WARN) {
      console.warn(this.messagePrefix + message, ...optionalParams);
    }
  }

  public log(message: any, ...optionalParams: any[]): void {
    if (this.checkLevel() >= LogLevel.ALL) {
      console.log(this.messagePrefix + message, ...optionalParams);
    }
  }
}

