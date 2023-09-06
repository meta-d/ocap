import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BusinessAreasService } from '@metad/cloud/state'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { shareReplay, switchMap, tap } from 'rxjs/operators'
import { IBusinessArea, ToastrService } from '../../../../@core/index'

@UntilDestroy()
@Component({
  selector: 'pac-business-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss']
})
export class BusinessAreasComponent implements OnInit {
  DisplayDensity = DisplayDensity

  loading = false
  private refresh$ = new BehaviorSubject<void>(null)
  public readonly groupTree$ = this.refresh$.pipe(
    tap(() => (this.loading = true)),
    switchMap(() => this.businessAreasStore.getGroupsTree()),
    tap(() => (this.loading = false)),
    untilDestroyed(this),
    shareReplay(1)
  )

  @ViewChild('createTempl') private createTempl: TemplateRef<ElementRef>

  parentId: string
  name: string
  constructor(
    private businessAreasStore: BusinessAreasService,
    private readonly _toastrService: ToastrService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  async addGroup(parent?: IBusinessArea) {
    this.parentId = parent?.id
    this.name = null
    const name = await firstValueFrom(
      this._dialog.open(this.createTempl, { panelClass: 'nx-dialog-container' }).afterClosed()
    )

    if (name) {
      await firstValueFrom(
        this.businessAreasStore.create({
          name,
          parentId: this.parentId
        })
      )

      this.refresh$.next()
    }
  }

  async deleteBusinessArea(item: IBusinessArea) {
    const cofirm = await firstValueFrom(this._dialog.open(ConfirmDeleteComponent, {data: {value: item.name}}).afterClosed())
    if (!cofirm) {
      return
    }
    
    try {
      await firstValueFrom(this.businessAreasStore.delete(item.id))
      this._toastrService.success('PAC.BUSINESS_AREA.Delete', { Default: 'Delete' })
      this.refresh$.next()
    } catch (err) {
      this._toastrService.error('PAC.BUSINESS_AREA.Delete', '', { Default: 'Delete' })
    }
  }

  refresh() {
    this.refresh$.next()
  }
}
