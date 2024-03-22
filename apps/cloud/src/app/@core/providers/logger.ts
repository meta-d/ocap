import { EnvironmentProviders, importProvidersFrom } from '@angular/core'
import { environment } from 'apps/cloud/src/environments/environment'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'

export function provideLogger(level?: NgxLoggerLevel): EnvironmentProviders {
  return importProvidersFrom(
    LoggerModule.forRoot({
      // serverLoggingUrl: '/api/logs',
      level: environment.production ? NgxLoggerLevel.WARN : level ?? NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    })
  )
}
