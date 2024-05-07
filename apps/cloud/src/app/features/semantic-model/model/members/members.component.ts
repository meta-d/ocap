import { CommonModule } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { ModelsService } from '@metad/cloud/state'
import { ISemanticModelMember } from '@metad/contracts'
import { PropertyDimension, getEntityDimensions } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { derivedAsync } from 'ngxtension/derived-async'
import { combineLatest, firstValueFrom, map } from 'rxjs'
import { SemanticModelService } from '../model.service'

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule, MatExpansionModule, MatButtonModule, MatListModule],
  selector: 'pac-model-members',
  templateUrl: 'members.component.html',
  styleUrl: 'members.component.scss'
})
export class ModelMembersComponent {
  readonly modelService = inject(SemanticModelService)
  readonly modelsService = inject(ModelsService)

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
            dimensions: getEntityDimensions(entityType)
          }))
        )
      )
    )
  })

  readonly loading = signal(false)

  async syncMember(cube, dimension: PropertyDimension) {
    this.loading.set(true)
    for (const hierarchy of dimension.hierarchies) {
      const members = await firstValueFrom(
        this.modelService.selectHierarchyMembers(cube.name, { dimension: dimension.name, hierarchy: hierarchy.name })
      )

      console.log(members)

      await firstValueFrom(
        this.modelsService.uploadDimensionMembers(
          this.modelService.modelSignal().id,
          members.map((member) => ({
            ...member,
            entity: cube.name
          }) as unknown as ISemanticModelMember)
        )
      )
    }

    this.loading.set(false)
  }
}
