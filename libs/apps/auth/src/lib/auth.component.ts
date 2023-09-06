import { Location } from '@angular/common'
import { Component } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Store } from '@metad/cloud/state'
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
  authenticated = false
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

  set language(value: string) {
    this.store.preferredLanguage = value
  }

  public readonly preferredLanguage$ = this.store.preferredLanguage$.pipe(
    map((preferredLanguage) => preferredLanguage ?? navigator.language ?? 'en')
  )

  private _AuthSub = this.auth.onAuthenticationChange().subscribe((authenticated: boolean) => {
    this.authenticated = authenticated
  })
  constructor(
    protected auth: PacAuthService,
    protected store: Store,
    protected location: Location,
  ) {}

  back() {
    this.location.back()
    return false
  }

  onLanguage(value) {
    this.language = value
  }
}
