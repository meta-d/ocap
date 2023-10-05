import { CommonModule } from '@angular/common'
import { Component, ElementRef, TemplateRef, ViewChild, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { BusinessAreasService } from '@metad/cloud/state'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { Subject, firstValueFrom } from 'rxjs'
import { IBusinessArea, routeAnimations } from '../../../@core'
import { ManageEntityBaseComponent, MaterialModule, SharedModule } from '../../../@shared'
import { BusinessAreasComponent } from './business-areas/areas.component'

@Component({
  standalone: true,
  selector: 'pac-business-area',
  templateUrl: './business-area.component.html',
  styleUrls: ['./business-area.component.scss'],
  animations: [routeAnimations],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    NgmCommonModule
  ]
})
export class BusinessAreaComponent extends ManageEntityBaseComponent<IBusinessArea> {
  private _dialog = inject(MatDialog)
  private businessAreasStore = inject(BusinessAreasService)

  @ViewChild('createTempl') private createTempl: TemplateRef<ElementRef>
  
  update$ = new Subject<void>()

  parentId = ''
  name = ''

  async createBusinessArea(parent?: IBusinessArea) {
    this.parentId = parent?.id
    this.name = null
    const name = await firstValueFrom(
      this._dialog.open(this.createTempl, { panelClass: 'ngm-dialog-container' }).afterClosed()
    )

    if (name) {
      const businessArea = await firstValueFrom(
        this.businessAreasStore.create({
          name,
          parentId: this.parentId
        })
      )

      this.update$.next()

      return businessArea
    }

    return null
  }
}
