import { Location } from '@angular/common'
import { Component, effect, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Store } from '@metad/cloud/state'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateService } from '@ngx-translate/core'
import { map } from 'rxjs/operators'
import { PacAuthService } from './services/auth.service'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-auth',
  styleUrls: ['./auth.component.scss'],
  templateUrl: './auth.component.html',
  host: {
    class: 'pac-auth'
  }
})
export class PacAuthComponent {
  readonly #translate = inject(TranslateService)
  protected auth = inject(PacAuthService)
  protected store = inject(Store)
  protected location = inject(Location)

  readonly language = toSignal(this.#translate.onLangChange.pipe(map(() => this.#translate.currentLang)))

  token = ''

  // showcase of how to use the onAuthenticationChange method
  links = [
    {
      title: '帮助',
      href: ''
    },
    {
      title: '隐私',
      href: ''
    },
    {
      title: '条款',
      href: ''
    }
  ]

  constructor() {
    effect(() => {
      console.log(this.language())
    })
  }

  back() {
    this.location.back()
    return false
  }

  onLanguage(value) {
    this.store.preferredLanguage = value
  }
}
