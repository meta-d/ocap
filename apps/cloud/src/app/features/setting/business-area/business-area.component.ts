import { CommonModule } from '@angular/common'
import { Component, ElementRef, TemplateRef, ViewChild, effect, inject, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { BusinessAreasService } from '@metad/cloud/state'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { IBusinessArea, routeAnimations } from '../../../@core'
import { MaterialModule, SharedModule } from '../../../@shared'

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
export class BusinessAreaComponent {
  private router = inject(Router)
  private _route = inject(ActivatedRoute)
  private _dialog = inject(MatDialog)
  private businessAreasStore = inject(BusinessAreasService)

  @ViewChild('createTempl') private createTempl: TemplateRef<ElementRef>

  openedBusinessAreas = signal([])
  currentBusinessArea = signal(null)
  parentId = ''
  name = ''
  constructor() {
    effect(
      () => {
        if (this.currentBusinessArea()) {
          const businessAreas = this.openedBusinessAreas()
          const index = businessAreas.findIndex((item) => item.id === this.currentBusinessArea().id)
          if (index > -1) {
            if (businessAreas[index] !== this.currentBusinessArea()) {
              this.openedBusinessAreas.set([
                ...businessAreas.slice(0, index),
                this.currentBusinessArea(),
                ...businessAreas.slice(index + 1)
              ])
            }
          } else {
            this.openedBusinessAreas.set([...businessAreas, this.currentBusinessArea()])
          }
        }
      },
      { allowSignalWrites: true }
    )
  }

  trackById(index: number, item: IBusinessArea) {
    return item?.id
  }

  async addGroup(parent?: IBusinessArea) {
    this.parentId = parent?.id
    this.name = null
    const name = await firstValueFrom(
      this._dialog.open(this.createTempl, { panelClass: 'nx-dialog-container' }).afterClosed()
    )

    if (name) {
      return await firstValueFrom(
        this.businessAreasStore.create({
          name,
          parentId: this.parentId
        })
      )
    }

    return null
  }

  setCurrentBusinessArea(businessArea: IBusinessArea) {
    this.currentBusinessArea.set(businessArea)
  }

  removeOpenedArea(businessArea: IBusinessArea) {
    this.currentBusinessArea.set(null)
    this.openedBusinessAreas.set(this.openedBusinessAreas().filter((item) => item.id !== businessArea.id))
    this.router.navigate(['.'], { relativeTo: this._route })
  }
}
