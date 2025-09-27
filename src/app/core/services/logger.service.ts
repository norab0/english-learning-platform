import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = LogLevel.INFO;

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      // Debug logging - can be implemented with proper logging service
    }
  }

  info(): void {
    if (this.logLevel <= LogLevel.INFO) {
      // Info logging - can be implemented with proper logging service
    }
  }

  warn(): void {
    if (this.logLevel <= LogLevel.WARN) {
      // Warning logging - can be implemented with proper logging service
    }
  }

  error(): void {
    if (this.logLevel <= LogLevel.ERROR) {
      // Error logging - can be implemented with proper logging service
    }
  }
}
