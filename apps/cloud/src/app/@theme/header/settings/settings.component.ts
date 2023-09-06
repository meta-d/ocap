import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { Router } from '@angular/router'
import { DensityDirective } from '@metad/ocap-angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { LANGUAGES, Store } from '../../../@core'
import { UserPipe } from '../../../@shared'

@UntilDestroy({ checkProperties: true })
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
      UserPipe
    ],
    selector: 'pac-header-settings',
    template: `<div role="tooltip" class="z-50">
    <div class="px-3 py-2 border-b flex items-center border-gray-200 rounded-t-lg dark:border-gray-600">
      <h3 class="mb-0 font-semibold">
        {{ 'PAC.MENU.UserSettings' | translate: { Default: 'User Settings' } }}
      </h3>:

      <span class="flex-1 overflow-hidden text-ellipsis">
        {{ isAuthenticated$ | async | user }}
      </span>
    </div>
    <div class="flex flex-col justify-start items-stretch" *ngIf="isAuthenticated$ | async as user">
        <div class="flex flex-col justify-start items-stretch p-2">
            <mat-form-field appearance="fill" displayDensity="cosy">
                <mat-label>{{ 'PAC.MENU.GENERAL.LANGUAGE' | translate: { Default: 'Language' } }}</mat-label>
                <mat-select
                [placeholder]="'PAC.MENU.GENERAL.LANGUAGE_PLACEHOLDER' | translate: { Default: 'Select Language' }"
                [ngModel]="preferredLanguage$ | async"
                (selectionChange)="onLanguageSelect($event)"
                name="language"
                >
                <mat-option *ngFor="let l of languages" [value]="l.value">
                    {{ 'PAC.SETTINGS.GENERAL.LANGUAGE.' + l.value | translate: { Default: l.label } }}
                </mat-option>
                </mat-select>

                <mat-icon matPrefix>translate</mat-icon>
            </mat-form-field>
        </div>

      <button mat-button (click)="onProfile()">
        <mat-icon>account_circle</mat-icon>
        <span>{{ 'PAC.menu.profile' | translate }}</span>
      </button>

      <button mat-button (click)="onLogoutClick()">
        <mat-icon>settings_power</mat-icon>
        <span>{{ 'PAC.menu.logout' | translate }}</span>
      </button>
    </div>
  </div>`,
})
export class HeaderSettingsComponent {
  languages = LANGUAGES

  public readonly isAuthenticated$ = this.store.user$
  preferredLanguage$ = this.store.preferredLanguage$

  constructor(private store: Store, private router: Router) {}

  onLanguageSelect({ value: language }): void {
    this.store.preferredLanguage = language
  }
  onProfile() {
    this.router.navigate(['/settings/account'])
  }
  onLogoutClick(): void {
    this.router.navigate(['/auth/logout'])
  }
}
