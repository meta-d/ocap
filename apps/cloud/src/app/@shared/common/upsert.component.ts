import { inject, signal } from '@angular/core'
import { CrudService } from '@metad/cloud/state'
import { getErrorMessage, ToastrService } from '../../@core'
import { catchError, tap } from 'rxjs/operators'
import { EMPTY } from 'rxjs'

/**
 */
export abstract class UpsertEntityComponent<T> {
  readonly _toastrService = inject(ToastrService)
  readonly saving = signal(false)

  constructor(protected service: CrudService<T>) {}

  save(entity: Partial<T>) {
    this.saving.set(true)
    return this.service.create(entity).pipe(
        tap(() => {
            this.saving.set(false)
            this._toastrService.success('PAC.Messages.SavedSuccessfully', { Default: 'Saved successfully' })
        }),
        catchError((error) => {
            this.saving.set(false)
            this._toastrService.error(getErrorMessage(error))
            return EMPTY
        })
    )
  }

  update(id: string, entity: Partial<T>) {
    this.saving.set(true)
    return this.service.update(id, entity).pipe(
        tap(() => {
            this.saving.set(false)
            this._toastrService.success('PAC.Messages.UpdatedSuccessfully', { Default: 'Updated successfully' })
        }),
        catchError((error) => {
            this.saving.set(false)
            this._toastrService.error(getErrorMessage(error))
            return EMPTY
        })
    )
  }
}
