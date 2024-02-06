import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatTabsModule } from '@angular/material/tabs'
import { pick } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { UsersService } from '@metad/cloud/state'
import { cloneDeep } from 'lodash-es'
import { firstValueFrom } from 'rxjs'
import { getErrorMessage, HttpStatus, Store, ToastrService, User } from '../../../@core'
import { UserFormsModule } from '../../../@shared/user/forms'
import { HttpErrorResponse } from '@angular/common/http'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    UserFormsModule,
    TranslateModule
  ],
  selector: 'pac-account-password',
  template: `<form class="flex flex-col items-start justify-start p-4 m-auto w-96"
  [formGroup]="passwordForm" (ngSubmit)="resetPassword()">
  <mat-form-field appearance="fill" floatLabel="always" class="self-stretch">
    <mat-label>
    {{ 'PAC.KEY_WORDS.CurrentPassword' | translate: {Default: 'Current Password'} }}  
    </mat-label>
    <input type="password" matInput formControlName="hash">
    <mat-error *ngIf="hash.invalid">{{ 'PAC.KEY_WORDS.Error' | translate: {Default: 'Error'} }}</mat-error>
  </mat-form-field>
  <mat-form-field appearance="fill" floatLabel="always" class="self-stretch">
    <mat-label>
      {{ 'PAC.KEY_WORDS.NewPassword' | translate: {Default: 'New Password'} }}
    </mat-label>
    <input type="password" matInput formControlName="password">
  </mat-form-field>

  <mat-form-field appearance="fill" floatLabel="always" class="self-stretch">
    <mat-label>
    {{ 'PAC.KEY_WORDS.ConfirmPassword' | translate: {Default: 'Confirm Password'} }}  
    </mat-label>
    <input type="password" matInput formControlName="confirmPassword">
  </mat-form-field>

  <button mat-raised-button [disabled]="passwordForm.invalid">
  {{ 'PAC.KEY_WORDS.Save' | translate: {Default: 'Save'} }}  
  </button>
</form>`,
  styles: [``]
})
export class PACAccountPasswordComponent {
  user: User
  passwordForm = new FormGroup({
    hash: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    confirmPassword: new FormControl(null, [Validators.required])
  })
  get hash() {
    return this.passwordForm.get('hash')
  }

  private _userSub = this.store.user$.pipe(takeUntilDestroyed()).subscribe((user) => {
    this.user = cloneDeep(user) as User
  })
  constructor(
    private readonly store: Store,
    private readonly userService: UsersService,
    private readonly _toastrService: ToastrService,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  async resetPassword() {
    if (this.passwordForm.valid) {
      try {
        await firstValueFrom(this.userService.password(this.user.id, pick(this.passwordForm.value, 'hash', 'password')))

        this._toastrService.success('PAC.MESSAGE.PasswordChange', {Default: 'Password change'})
      } catch(err) {
        this._toastrService.error(getErrorMessage(err))
        if (err instanceof HttpErrorResponse) {
          if (err.status === HttpStatus.FORBIDDEN) {
            this.passwordForm.get('hash').setErrors({
              error: `Error`
            })
            this._cdr.detectChanges()
          }
        }
      }
    }
  }
}
