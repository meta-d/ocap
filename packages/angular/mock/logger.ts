import { EnvironmentProviders, importProvidersFrom } from '@angular/core'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'

export function provideLogger(): EnvironmentProviders {
  return importProvidersFrom(
    LoggerModule.forRoot({
      // serverLoggingUrl: '/api/logs',
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    })
  )
}
