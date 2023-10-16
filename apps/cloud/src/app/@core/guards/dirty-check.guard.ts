import { Injectable, inject } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRouteSnapshot } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfirmSnackBar } from '@metad/components/confirm'
import { Observable, defer, isObservable, merge, of } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'
import { IsDirty } from '@metad/core'


@Injectable()
export class DirtyCheckGuard  {
  private translateService = inject(TranslateService)
  private _snackBar = inject(MatSnackBar)

  canDeactivate(component: IsDirty, currentRoute: ActivatedRouteSnapshot): Observable<boolean> {
    let dirty$: Observable<boolean>
    const componentDirty = component.isDirty$

    if (typeof componentDirty === 'function') {
      dirty$ = defer(() => toObservable(componentDirty()))
    } else {
      dirty$ = toObservable(component.isDirty())
    }

    return dirty$.pipe(
      switchMap((isDirty) => {
        if (!isDirty) {
          return of(true)
        }
        return toObservable(this.confirmChanges(currentRoute))
      }),
      take(1)
    )
  }

  confirmChanges(currentRoute: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const confirm = this._snackBar.openFromComponent(ConfirmSnackBar, {
      verticalPosition: 'top',
      horizontalPosition: 'center',
      duration: 3000,
      data: {
        message: this.getTranslation('PAC.MESSAGE.ConfirmExitDirtyData', {Default: 'Has dirty data, confirm exit?'}),
        action: this.getTranslation('PAC.MESSAGE.Sure', {Default: 'Sure'})
      }
    })

    return merge(confirm.afterDismissed().pipe(map(() => false)), confirm.onAction().pipe(map(() => true))).pipe(
      take(1)
    )
  }

  getTranslation(key: string, params?: any): string {
    let result = ''
    this.translateService.get(key, params).subscribe((res) => (result = res))
    return result
  }
}

function toObservable<T>(source: T | Observable<T>): Observable<T> {
  return isObservable(source) ? source : of(source)
}
