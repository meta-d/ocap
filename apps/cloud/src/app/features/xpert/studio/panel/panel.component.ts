import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { DensityDirective } from '@metad/ocap-angular/core'
import { MaterialModule } from '../../../../@shared/index'
import { SelectionService } from '../domain'
import { XpertStudioComponent } from '../studio.component'
import { XpertStudioPanelRoleComponent } from './xpert-role/role.component'

@Component({
  selector: 'xpert-studio-panel',
  standalone: true,
  imports: [CommonModule, CdkMenuModule, MaterialModule, DensityDirective, XpertStudioPanelRoleComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class XpertStudioPanelComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly selectionService = inject(SelectionService)

  readonly selectedNode = toSignal(this.selectionService.singleNode$)
  readonly role = computed(() => {
    const selectedNode = this.selectedNode()
    if (selectedNode?.type === 'role') {
      return selectedNode.entity
    }
    return null
  })
  readonly visiable = signal(false)
  private singleNodeSub = this.selectionService.singleNode$.pipe(takeUntilDestroyed()).subscribe((node) => {
    this.visiable.set(!!node)
  })

  constructor() {
    effect(() => {
      console.log(this.selectedNode())
    })
  }

  close() {
    this.visiable.set(false)
  }
}
