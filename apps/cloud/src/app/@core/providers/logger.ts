import { EnvironmentProviders, importProvidersFrom } from '@angular/core'
import { environment } from 'apps/cloud/src/environments/environment'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'

export function provideLogger(): EnvironmentProviders {
  return importProvidersFrom(
    LoggerModule.forRoot({
      // serverLoggingUrl: '/api/logs',
      level: environment.production ? NgxLoggerLevel.WARN : NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    })
  )
}
