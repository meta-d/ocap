import { CommonModule } from '@angular/common'
import { Component, computed, inject, input, model, signal, viewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule, MatSelectionList } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ModelsService } from '@metad/cloud/state'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import { Cube, EntityType, getEntityDimensions, getEntityHierarchy } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { ToastrService, tryHttp } from 'apps/cloud/src/app/@core'
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
    NgmEntityPropertyComponent
  ],
  selector: 'pac-model-members-cube',
  templateUrl: 'cube.component.html',
  styleUrl: 'cube.component.scss'
})
export class ModelMembersCubeComponent {
  readonly modelService = inject(SemanticModelService)
  readonly modelsService = inject(ModelsService)
  readonly toastrService = inject(ToastrService)

  readonly cube = input<Cube & { entityType?: EntityType }>(null)
  readonly selectionList = viewChild('selection', { read: MatSelectionList })

  readonly dimensions = computed(() => this.cube() ? getEntityDimensions(this.cube().entityType) : [])
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

  setAll(completed: boolean) {
    this.allSelected.set(completed)

    if (!this.dimensions()?.length) {
      return
    }

    this.allSelected() ? this.selectionList().selectAll() : this.selectionList().deselectAll()
  }

  async syncMember() {
    const cube = this.cube().name;
    const dimensions = this.dimensions()
    // const storeMembers: Record<string, IDimensionMember[]> = {}
    if (this.selectedDims()) {
      this.loading.set(true)
      for (const name of this.selectedDims()) {
        // storeMembers[name] = []

        let storeMembers = []
        const hierarchy = getEntityHierarchy(this.cube().entityType, name)
        // const dimension = dimensions.find((dim) => dim.name === name)
        // for (const hierarchy of dimension.hierarchies) {
          const members = await tryHttp(
            this.modelService.selectHierarchyMembers(cube, { dimension: hierarchy.dimension, hierarchy: hierarchy.name }),
            this.toastrService
          )
          if (members) {
            storeMembers = storeMembers.concat(members)
          }
        // }

        this.members.update((members) => ({
          ...members,
          [name]: storeMembers
        }))
      }
      
      this.loading.set(false)
      this.loaded.set(true)
    }
  }

  async uploadMembers(dimensions: string[]) {
    const cube = this.cube().name;
    this.loading.set(true)
    await tryHttp(
      this.modelsService.uploadDimensionMembers(
        this.modelService.modelSignal().id,
        {
          [cube]: dimensions
        }
      ),
      this.toastrService
    )
    this.loading.set(false)
  }
}
