import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, model, signal, viewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialog } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule, MatSelectionList } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ModelsService } from '@metad/cloud/state'
import { NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import { Cube, EntityType, getEntityDimensions, getEntityHierarchy } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  ISemanticModelEntity,
  ModelEntityType,
  SemanticModelEntityService,
  ToastrService,
  getErrorMessage,
  tryHttp
} from 'apps/cloud/src/app/@core'
import { uniq } from 'lodash-es'
import { EMPTY, catchError, firstValueFrom, switchMap, tap } from 'rxjs'
import { SemanticModelService } from '../../model.service'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatCheckboxModule,
    DensityDirective,
    AppearanceDirective,
    NgmEntityPropertyComponent
  ],
  selector: 'pac-model-members-cube',
  templateUrl: 'cube.component.html',
  styleUrl: 'cube.component.scss'
})
export class ModelMembersCubeComponent {
  readonly modelService = inject(SemanticModelService)
  readonly modelEntityService = inject(SemanticModelEntityService)
  readonly modelsService = inject(ModelsService)
  readonly toastrService = inject(ToastrService)
  readonly dialog = inject(MatDialog)
  readonly translate = inject(TranslateService)

  readonly cube = model<
    Cube & {
      entityType?: EntityType
      __entity__: ISemanticModelEntity
    }
  >(null)
  readonly selectionList = viewChild('selection', { read: MatSelectionList })

  readonly dimensions = computed(() => (this.cube() ? getEntityDimensions(this.cube().entityType) : []))
  readonly selectedDims = model(null)
  readonly allSelected = signal(false)

  readonly loaded = signal(false)
  readonly loading = signal(false)

  readonly members = signal({})

  readonly someSelected = computed(() => {
    const selectedDims = this.selectedDims()
    const dimensions = this.cube()?.dimensions
    if (!dimensions) {
      return false
    }

    return dimensions.some((dim) => selectedDims?.includes(dim.name)) && !this.allSelected()
  })

  readonly entity = computed(() => this.cube()?.__entity__)
  readonly syncMembers = computed(() => this.entity()?.options?.members ?? {})

  constructor() {
    effect(
      () => {
        if (this.entity() && !this.selectedDims()) {
          this.selectedDims.set(this.entity()?.options?.vector?.hierarchies ?? [])
        }
      },
      { allowSignalWrites: true }
    )
  }

  setAll(completed: boolean) {
    this.allSelected.set(completed)

    if (!this.dimensions()?.length) {
      return
    }

    this.allSelected() ? this.selectionList().selectAll() : this.selectionList().deselectAll()
  }

  async refresh() {
    const cube = this.cube().name

    this.loading.set(true)
    if (this.entity()?.id) {
      const entity = await firstValueFrom(this.modelEntityService.getOne(this.entity().id))
      this.cube.update((cube) => ({ ...cube, __entity__: entity }))
    }

    if (this.selectedDims()) {
      for (const name of this.selectedDims()) {
        let storeMembers = []
        const hierarchy = getEntityHierarchy(this.cube().entityType, name)
        if (!hierarchy) {
          this.toastrService.error('PAC.MODEL.CanntFoundHierarchy', null, {Default: `Can't found hierarchy '${name}'`, value: name})
        } else {
          const members = await tryHttp(
            this.modelService.selectHierarchyMembers(cube, { dimension: hierarchy.dimension, hierarchy: hierarchy.name }),
            this.toastrService
          )
          if (members) {
            storeMembers = storeMembers.concat(members)
          }

          this.members.update((members) => ({
            ...members,
            [name]: storeMembers
          }))
        }
      }
      this.loaded.set(true)
    }

    this.loading.set(false)
  }

  async createModelEntity(dimensions: string[]) {
    const cube = this.cube().name
    this.loading.set(true)

    this.modelEntityService
      .create(this.modelService.modelSignal().id, {
        name: cube,
        caption: this.cube().caption,
        type: ModelEntityType.Cube,
        options: {
          vector: {
            hierarchies: uniq(dimensions)
          }
        }
      })
      .subscribe({
        next: (entity) => {
          this.cube.update((cube) => ({ ...cube, __entity__: entity }))
          this.toastrService.success('PAC.MODEL.CreatedSuccessfully', { Default: 'Created Successfully!' })
        },
        error: (err) => {
          this.toastrService.error(getErrorMessage(err))
          this.loading.set(false)
        },
        complete: () => {
          this.loading.set(false)
        }
      })
  }

  deleteMembers(id: string) {
    this.dialog
      .open(NgmConfirmDeleteComponent, {
        data: {
          value: this.cube().caption,
          information: this.translate.instant('PAC.MODEL.SureDeleteDimensionMembers', {
            Default: 'Are you sure to delete the synced dimension members in this cube?'
          })
        }
      })
      .afterClosed()
      .pipe(
        switchMap((confirm) =>
          confirm
            ? this.modelEntityService.delete(id).pipe(
                tap(() => {
                  this.cube.update((state) => ({ ...state, __entity__: null }))
                  this.toastrService.success('PAC.MODEL.DeletedSuccessfully', { Default: 'Deleted Successfully!' })
                }),
                catchError((err) => {
                  this.toastrService.error(getErrorMessage(err))
                  return EMPTY
                })
              )
            : EMPTY
        )
      )
      .subscribe()
  }
}
