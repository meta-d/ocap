import { CommonModule } from '@angular/common'
import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
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

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
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

  readonly store = inject(Store)
  readonly router = inject(Router)
  readonly #translate = inject(TranslateService)

  // preferredTheme$ = this.store.preferredTheme$

  readonly user$ = toSignal(this.store.user$)
  readonly isAuthenticated$ = computed(() => Boolean(this.store.user))
  readonly language$ = toSignal(this.store.preferredLanguage$.pipe(startWith(this.#translate.currentLang)))

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
