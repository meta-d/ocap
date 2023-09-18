import { CommonModule } from '@angular/common'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core'
import { PACStateModule } from '@metad/cloud/state'
import { AuthModule } from './auth/auth.module'
import { throwIfAlreadyLoaded } from './module-import-guard'
import { HttpLoaderFactory, MyMissingTranslationHandler } from './theme'


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,

    // 3rd party
    // FontAwesomeModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler
      },
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    AuthModule,
    PACStateModule.forRoot()
  ],
  exports: [
    // 3rd party
    // FontAwesomeModule,
    TranslateModule,
  ],
  declarations: [
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule')
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: []
    }
  }
}
