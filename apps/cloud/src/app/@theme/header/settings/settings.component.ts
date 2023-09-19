import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { Router } from '@angular/router'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { LANGUAGES, Store } from '../../../@core'
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

  private store = inject(Store)
  private router = inject(Router)

  public readonly isAuthenticated$ = this.store.user$
  preferredLanguage$ = this.store.preferredLanguage$
  preferredTheme$ = this.store.preferredTheme$

  onLanguageSelect(language): void {
    this.store.preferredLanguage = language
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
