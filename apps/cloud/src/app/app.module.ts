import { PlatformModule } from '@angular/cdk/platform'
import { registerLocaleData } from '@angular/common'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import en from '@angular/common/locales/en'
import localeZhExtra from '@angular/common/locales/extra/zh-Hans'
import zh from '@angular/common/locales/zh'
import localeZh from '@angular/common/locales/zh-Hans'
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { BrowserModule, HammerModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouteReuseStrategy } from '@angular/router'
import { ServiceWorkerModule } from '@angular/service-worker'
import { Ability, PureAbility } from '@casl/ability'
import { AbilityModule } from '@casl/angular'
import { NxCoreModule, registerLocaleData as nxRegisterLocaleData, zhHans } from '@metad/core'
import * as Sentry from "@sentry/angular"
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MarkdownModule } from 'ngx-markdown'
import { NgxPermissionsModule } from 'ngx-permissions'
import { environment } from '../environments/environment'
import {
  APIInterceptor,
  AppInitService,
  AppRouteReuseStrategy,
  CoreModule,
  LanguageInterceptor,
  TenantInterceptor,
  TokenInterceptor,
  UpdateService
} from './@core'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'

const TYPE_KEY = '__subject__'
function detectSubjectType(subject) {
  if (!subject || typeof subject === 'string') {
    return subject
  }

  return subject[TYPE_KEY]
}

const LOCALE = 'zh-Hans'
registerLocaleData(localeZh, LOCALE, localeZhExtra)
registerLocaleData(zh)
registerLocaleData(en)
nxRegisterLocaleData(zhHans, LOCALE)

@NgModule({
  declarations: [AppComponent],
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,
    PlatformModule,
    HammerModule,

    // RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatSnackBarModule,
    CoreModule.forRoot(),
    NgxPermissionsModule.forRoot(),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.WARN,
      serverLogLevel: NgxLoggerLevel.ERROR,
      colorScheme: ['purple', 'teal', 'gray', 'gray', 'red', 'red', 'red'],
      enableSourceMaps: true,
    }),
    NxCoreModule.forRoot(),
    AbilityModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: false, // environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

    MarkdownModule.forRoot()
  ],
  providers: [
    UpdateService,
    {
      provide: LOCALE_ID,
      useValue: LOCALE
    },
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LanguageInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitService: AppInitService) => () => {
        return appInitService.init()
      },
      deps: [AppInitService],
      multi: true
    },
    { provide: Ability, useValue: new Ability([], { detectSubjectType }) },
    { provide: PureAbility, useExisting: Ability },

    // {
    //   provide: ErrorHandler,
    //   useValue: Sentry.createErrorHandler({
    //     showDialog: false,
    //   }),
    // },
    // {
    //   provide: Sentry.TraceService,
    //   deps: [Router],
    // },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: () => () => {},
    //   deps: [Sentry.TraceService],
    //   multi: true,
    // },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
