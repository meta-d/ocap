import { ZhHans } from '@metad/ocap-angular/i18n'
import { TranslateLoader } from '@ngx-translate/core'
import { Observable, of } from 'rxjs'

export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(ZhHans)
  }
}
