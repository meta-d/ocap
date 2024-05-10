import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ModelsService } from '@metad/cloud/state'
import { ISemanticModelMember } from '@metad/contracts'
import { PropertyDimension, getEntityDimensions } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { ToastrService, tryHttp } from 'apps/cloud/src/app/@core'
import { flatten } from 'lodash-es'
import { derivedAsync } from 'ngxtension/derived-async'
import { combineLatest, map } from 'rxjs'
import { SemanticModelService } from '../model.service'

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
    MatCheckboxModule
  ],
  selector: 'pac-model-members',
  templateUrl: 'members.component.html',
  styleUrl: 'members.component.scss'
})
export class ModelMembersComponent {
  readonly modelService = inject(SemanticModelService)
  readonly modelsService = inject(ModelsService)
  readonly toastrService = inject(ToastrService)

  readonly cubes = toSignal(this.modelService.cubes$)
  readonly virtualCubes = toSignal(this.modelService.virtualCubes$)

  readonly allCubes = derivedAsync(() => {
    const cubes = this.cubes() ?? []
    const virtualCubes = this.virtualCubes() ?? []
    return combineLatest(
      [...cubes, ...virtualCubes].map((cube) =>
        this.modelService.selectEntityType(cube.name).pipe(
          map((entityType) => ({
            name: cube.name,
            caption: cube.caption,
            dimensions: getEntityDimensions(entityType),
            selectedDims: []
          }))
        )
      )
    )
  })

  readonly loading = signal(false)

  readonly members = signal({})

  async syncMember(cube: string, dimensions: PropertyDimension[]) {
    this.loading.set(true)
    const storeMembers = {}
    for (const dimension of dimensions) {
      storeMembers[dimension.name] = []
      for (const hierarchy of dimension.hierarchies) {
        const members = await tryHttp(
          this.modelService.selectHierarchyMembers(cube, { dimension: dimension.name, hierarchy: hierarchy.name }),
          this.toastrService
        )
        if (members) {
          storeMembers[dimension.name].push(...members)
          console.log(members)
        }
      }
    }

    this.members.set(storeMembers)

    this.loading.set(false)
  }
  
  async uploadMembers(cube: string, dimensions: string[]) {
    this.loading.set(true)
    await tryHttp(
      this.modelsService.uploadDimensionMembers(
        this.modelService.modelSignal().id,
        flatten(dimensions.map((dimension) => this.members()[dimension] ?? [])).map(
          (member) =>
            ({
              ...member,
              entity: cube
            } as unknown as ISemanticModelMember)
        )
      ),
      this.toastrService
    )
    this.loading.set(false)
  }
}
