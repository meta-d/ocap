import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { DataSourceService } from '@metad/cloud/state'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { switchMap, tap } from 'rxjs/operators'
import { IDataSource, ROUTE_ANIMATIONS_ELEMENTS } from '../../../@core/index'
import { PACDataSourceCreationComponent } from './creation/creation.component'
import { PACDataSourceEditComponent } from './edit/edit.component'
import { NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'

@Component({
  selector: 'pac-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss']
})
export class PACDataSourcesComponent {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS

  private readonly dataSource = inject(DataSourceService)
  private readonly _dialog = inject(MatDialog)

  loading = false
  private readonly refresh$ = new BehaviorSubject<void>(null)
  readonly dataSources = toSignal(
    this.refresh$.pipe(
      tap(() => (this.loading = true)),
      switchMap(() => this.dataSource.getAll(['type'])),
      tap(() => (this.loading = false))
    )
  )

  async create() {
    const result = await firstValueFrom(this._dialog.open(PACDataSourceCreationComponent).afterClosed())

    if (result) {
      this.refresh$.next()
    }
  }

  async edit(dataSource: IDataSource) {
    const result = await firstValueFrom(
      this._dialog
        .open(PACDataSourceEditComponent, {
          data: {
            id: dataSource.id
          }
        })
        .afterClosed()
    )

    if (result) {
      this.refresh$.next()
    }
  }

  async copy(data: IDataSource) {
    const result = await firstValueFrom(this._dialog.open(PACDataSourceCreationComponent, { data }).afterClosed())

    if (result) {
      this.refresh$.next()
    }
  }

  async remove(data: IDataSource) {
    const result = await firstValueFrom(
      this._dialog.open(NgmConfirmDeleteComponent, { data: { value: data.name } }).afterClosed()
    )

    if (result) {
      await firstValueFrom(this.dataSource.delete(data.id))
      this.refresh$.next()
    }
  }
}
