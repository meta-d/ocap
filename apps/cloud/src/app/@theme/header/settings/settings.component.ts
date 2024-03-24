import { CommonModule } from '@angular/common'
import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { Router } from '@angular/router'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { startWith } from 'rxjs'
import { LANGUAGES, LanguagesMap, Store } from '../../../@core'
import { UserPipe } from '../../../@shared'
import { ThemesEnum } from '@metad/core'

const THEMES = [
  {
    key: 'system',
    caption: 'System',
    icon: 'settings_suggest'
  },
  {
    key: 'light',
    caption: 'Light',
    icon: 'light_mode'
  },
  {
    key: 'dark',
    caption: 'Dark',
    icon: 'dark_mode'
  },
  {
    key: 'dark-green',
    caption: 'Dark Green',
    icon: 'dark_mode'
  }
]

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    DensityDirective,
    UserPipe,
    NgmSelectComponent
  ],
  selector: 'pac-header-settings',
  templateUrl: './settings.component.html'
})
export class HeaderSettingsComponent {
  languages = LANGUAGES
  DisplayBehaviour = DisplayBehaviour
  ThemesEnum = ThemesEnum

  readonly store = inject(Store)
  readonly router = inject(Router)
  readonly #translate = inject(TranslateService)

  readonly preferredTheme$ = toSignal(this.store.preferredTheme$)
  readonly preferredThemeIcon$ = computed(() => THEMES.find((item) => item.key === this.preferredTheme$())?.icon)

  readonly user$ = toSignal(this.store.user$)
  readonly isAuthenticated$ = computed(() => Boolean(this.store.user))
  readonly language$ = toSignal(this.store.preferredLanguage$.pipe(startWith(this.#translate.currentLang)))

  readonly themesT$ = toSignal(this.#translate.stream('PAC.Themes'))

  readonly themeOptions$ = computed(() => {
    const translate = this.themesT$()
    return THEMES.map((item) => ({
      ...item,
      caption: translate[item.caption] ?? item.caption
    }))
  })

  onLanguageSelect(language: string): void {
    this.store.preferredLanguage = LanguagesMap[language] ?? language
  }
  onThemeSelect(mode: string): void {
    this.store.preferredTheme = mode
  }
  onProfile() {
    this.router.navigate(['/settings/account'])
  }
  onLogoutClick(): void {
    this.router.navigate(['/auth/logout'])
  }
}
