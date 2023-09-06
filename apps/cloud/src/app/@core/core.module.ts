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
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { PACStateModule } from '@metad/cloud/state'
import { ZhHans } from '@metad/ocap-angular/i18n'
import { zhHans as CoreZhHans } from '@metad/core'
import { ZhHans as StoryZhHans } from '@metad/story/i18n'
import { ZhHans as AuthZhHans } from '@metad/cloud/auth'
import { ZhHans as IAppZhHans } from '@metad/cloud/indicator-market/i18n'
import { map, Observable } from 'rxjs'
import { AuthModule } from './auth/auth.module'
import { throwIfAlreadyLoaded } from './module-import-guard'

class CustomTranslateHttpLoader extends TranslateHttpLoader {
  getTranslation(lang: string): Observable<Object> {
    let ocapTranslates = {}
    switch(lang) {
      case 'zh-Hans':
      case 'zh-CN':
        ocapTranslates = {
          ...ZhHans,
          ...CoreZhHans,
          ...StoryZhHans,
          ...AuthZhHans,
          ...IAppZhHans
        }
        break
      default:
    }
    return super.getTranslation(lang).pipe(
      map((t) => ({
        ...t,
        ...ocapTranslates
      }))
    )
  }
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new CustomTranslateHttpLoader(http, `./assets/i18n/`, '.json')
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    if (params.interpolateParams) {
      return params.interpolateParams['Default'] || params.key
    }
    return params.key
  }
}

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
