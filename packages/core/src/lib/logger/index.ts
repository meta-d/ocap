export function createLogger(options?: LoggerOptions) {
  return {
    debug: (...params) => (options?.level ? options.level <= LoggerLevel.debug : true) && console.debug(...params),
    info: (...params) => console.info(...params),
    log: (...params) => console.log(...params),
    warn: (...params) => (options?.level ? options.level <= LoggerLevel.warn : true) && console.warn(...params)
  }
}

export interface LoggerOptions {
  level: LoggerLevel
}

export enum LoggerLevel {
  debug,
  log,
  info,
  warn,
  error
}
