import { ChangeDetectorRef, Component, Inject } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { delay, tap } from 'rxjs'
import { PAC_AUTH_OPTIONS } from '../auth.options'
import { getDeepFromObject } from '../helpers'
import { PacAuthResult, PacAuthService } from '../services'

@Component({
  selector: 'pac-reset-password',
  templateUrl: 'reset-password.component.html',
  styleUrls: ['reset-password.component.scss']
})
export class ResetPasswordComponent {
  strategy = ''
  form = new FormGroup({
    password: new FormControl<string>(null),
    confirmPassword: new FormControl<string>(null)
  })

  submitted = false
  constructor(
    private authService: PacAuthService,
    @Inject(PAC_AUTH_OPTIONS) protected options = {},
    private translateService: TranslateService,
    private _snackBar: MatSnackBar,
    private readonly router: Router,
    private _cdr: ChangeDetectorRef
  ) {
    this.strategy = this.getConfigValue('forms.login.strategy')
  }

  resetPass() {
    this.submitted = true
    this.authService
      .resetPassword(this.strategy, this.form.value)
      .pipe(
        tap((result: PacAuthResult) => {
          if (result.isSuccess()) {
            let RESET_SUCCESS = ''
            this.translateService
              .get('Auth.ResetPasswordSuccess', { Default: 'Reset Password Success' })
              .subscribe((value) => {
                RESET_SUCCESS = value
              })
            this._snackBar.open(RESET_SUCCESS, '', { duration: 2000 })
          } else {
            throw new Error(result.getErrors()[0])
          }
        }),
        delay(2000)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login'])
        },
        error: (err) => {
          this.submitted = false
          this._cdr.detectChanges()

          let RESET_FAIL = ''
          this.translateService.get('Auth.ResetPasswordFail', { Default: 'Reset Password Fail' }).subscribe((value) => {
            RESET_FAIL = value
          })
          this._snackBar.open(RESET_FAIL, '', { duration: 2000 })
        }
      })
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null)
  }
}
