import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { ModelsService } from '@metad/cloud/state'
import { NgmConfirmDeleteComponent, NgmTableComponent, TableColumn } from '@metad/ocap-angular/common'
import { AppearanceDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { ChatBIModelService, Store, ToastrService, getErrorMessage, routeAnimations } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-chatbi-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss'],
  imports: [CommonModule, RouterModule, TranslateModule, MaterialModule, AppearanceDirective, NgmTableComponent],
  animations: [routeAnimations]
})
export class ChatBIModelsComponent extends TranslationBaseComponent {
  readonly modelsService = inject(ModelsService)
  readonly chatbiModelsService = inject(ChatBIModelService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly dialog = inject(MatDialog)

  readonly organizationId$ = this.#store.selectOrganizationId()

  readonly models = toSignal(this.chatbiModelsService.getAll())
  readonly allModels = toSignal(this.modelsService.getMy())

  readonly columns = signal<TableColumn[]>([
    {
      name: 'model',
      caption: 'Model'
    }
  ])

  readonly loading = signal(false)

  addModel() {
    this.router.navigate(['create'], { relativeTo: this.route })
  }

  refresh() {
    this.chatbiModelsService.refresh()
  }

  editModel(id: string) {
    this.router.navigate([id], { relativeTo: this.route })
  }

  deleteModel(id: string, cubeCaption: string) {
    this.dialog
      .open(NgmConfirmDeleteComponent, {
        data: {
          value: id,
          information: cubeCaption
        }
      })
      .afterClosed()
      .pipe(
        switchMap((confirm) => {
          if (confirm) {
            this.loading.set(true)
            return this.chatbiModelsService.delete(id)
          } else {
            return EMPTY
          }
        })
      )
      .subscribe({
        next: () => {
          this._toastrService.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully' })
          return this.refresh()
        },
        error: (error) => {
          this._toastrService.error(getErrorMessage(error))
          this.loading.set(false)
        }
      })
  }
}
