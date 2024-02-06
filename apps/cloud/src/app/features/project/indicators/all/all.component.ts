import { CommonModule } from '@angular/common'
import { Component, OnDestroy, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { IndicatorsService } from '@metad/cloud/state'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { NgmTableComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { firstValueFrom, map } from 'rxjs'
import { IIndicator, ToastrService } from '../../../../@core/index'
import { ProjectComponent } from '../../project.component'
import { ProjectIndicatorsComponent } from '../indicators.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    ButtonGroupDirective,
    DensityDirective,
    AppearanceDirective,
    NgmTableComponent
  ],
  selector: 'pac-indicator-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllIndicatorComponent implements OnDestroy {
  private projectComponent = inject(ProjectComponent)
  private indicatorsComponent = inject(ProjectIndicatorsComponent)
  private indicatorsService = inject(IndicatorsService)
  private toastrService = inject(ToastrService)
  private _dialog = inject(MatDialog)

  public readonly indicators$ = this.projectComponent.project$.pipe(
    map((project) => project?.indicators),
    takeUntilDestroyed()
  )

  async onDelete(indicator: IIndicator) {
    const cofirm = await firstValueFrom(
      this._dialog.open(ConfirmDeleteComponent, { data: { value: indicator.name } }).afterClosed()
    )
    if (!cofirm) {
      return
    }

    try {
      await firstValueFrom(this.indicatorsService.delete(indicator.id))
      this.toastrService.success('PAC.INDICATOR.DeleteIndicator')
      this.projectComponent._removeIndicator(indicator.id)
    } catch (err) {
      this.toastrService.error(err)
    }
  }

  trackByName(_: number, item: IIndicator): string {
    return item.name
  }

  groupFilterFn(list: string[], item: IIndicator) {
    return list.some((name) => item.businessAreaId === name)
  }

  codeSortFn(a: IIndicator, b: IIndicator) {
    return a.code.localeCompare(b.code)
  }

  onRowSelectionChanging(rows: any) {
    this.indicatorsComponent.selectedIndicators = rows
  }

  ngOnDestroy(): void {
    this.indicatorsComponent.selectedIndicators = []
  }
}
