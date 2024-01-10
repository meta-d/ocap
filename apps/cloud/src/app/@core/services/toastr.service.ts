import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { ConfirmSnackBar } from '@metad/components/confirm'
import { catchError, EMPTY, map, merge, Observable, take, takeUntil, tap } from 'rxjs'
import { SnackProcessingComponent } from '../../@theme/snack/processing'
import { getErrorMessage } from '../types'

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  constructor(private readonly _snackBar: MatSnackBar, private readonly translateService: TranslateService) {}

  success(message: any, translationParams: Object = {}, title?: string) {
    let displayMessage = ''

    if (message && message.message && typeof message.message === 'string') {
      displayMessage = message.message
    } else {
      displayMessage = message
    }

    return this._snackBar.open(
      this.getTranslation(displayMessage, translationParams),
      this.getTranslation(title || 'PAC.TOASTR.TITLE.SUCCESS'),
      { duration: 2000 }
    )
  }

  warning(message: any, translationParams: Object = {}, title?: string, config?: MatSnackBarConfig) {
    const { duration } = config ?? {}
    let displayMessage = ''

    if (message && message.message && typeof message.message === 'string') {
      displayMessage = message.message
    } else {
      displayMessage = message
    }

    this._snackBar.open(
      this.getTranslation(displayMessage, translationParams),
      this.getTranslation(title || 'PAC.TOASTR.TITLE.WARNING', {Default: '💡'}),
      { duration: duration ?? 3000 }
    )
  }

  danger(error: any, title: string = 'PAC.TOASTR.TITLE.ERROR', translationParams: Object = {}) {
    const displayMessage = getErrorMessage(error)
    // if (error instanceof HttpErrorResponse && typeof error.error.message === 'string') {
    //   displayMessage = error.error.message
    // }
    // // 等同于 HttpErrorResponse ?
    // else if (error.error && error.error.message && typeof error.error.message === 'string') {
    //   displayMessage = error.error.message
    // } else if (error.message && typeof error.message === 'string') {
    //   displayMessage = error.message
    // } else {
    //   displayMessage = error
    // }

    this._snackBar.open(
      this.getTranslation(displayMessage, translationParams),
      this.getTranslation(title || 'PAC.TOASTR.TITLE.ERROR'),
      { duration: 5000 }
    )

  }

  error(message: any, title: string = 'PAC.TOASTR.TITLE.ERROR', translationParams: Object = {}) {
    this.danger(message, title, translationParams)
  }

  info(message: {code: string, default: string}, action?: {code: string, default: string},
    options?: {
      duration: 5000,
    }
  ) {
    return this._snackBar.open(
      this.getTranslation(message.code, {Default: message.default}),
      action ? this.getTranslation(action.code, {Default: action.default}) : '💡',
      { duration: options?.duration ?? 3000 }
    )
  }

  private getTranslation(prefix: string, params?: Object) {
    return this.translateService.instant(prefix, params)
  }

  update({code, params}, fun: () => Observable<any>) {
    const title = this.getTranslation(code, params)
    const message = this.getTranslation('PAC.TOASTR.Updating', {value: title, Default: `${title} Updating...`})
    const uploading = this._snackBar.openFromComponent(SnackProcessingComponent, {
      panelClass: 'pac-snack-uploading',
      data: {
        message
      }})
    return fun().pipe(
      takeUntil(uploading.onAction()),
      catchError((err) => {
        uploading.instance.error(<HttpErrorResponse>err.error)
        return EMPTY
      }),
      tap(() => {
        const message = this.getTranslation('PAC.TOASTR.UpdateDone', {value: title, Default: `${title} Updated!`})
        uploading.instance.done(message)
      })
    )
  }

  confirm({code, params}, config?: MatSnackBarConfig) {
    const { duration, verticalPosition, horizontalPosition } = config ?? {}
    const message = this.getTranslation(code, params)
    const confirm = this.getTranslation('PAC.KEY_WORDS.Confirm', {Default: 'Confirm'})
    const _snackBarRef = this._snackBar.openFromComponent(ConfirmSnackBar, {
      verticalPosition: verticalPosition ?? 'bottom',
      horizontalPosition: horizontalPosition ?? 'center',
      duration: duration ?? 3000,
      data: {
        message,
        action: confirm
      }
    })

    return merge(_snackBarRef.afterDismissed().pipe(map(() => false)), _snackBarRef.onAction().pipe(map(() => true))).pipe(take(1))
  }
}
