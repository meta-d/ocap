import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, model, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { DensityDirective } from '@metad/ocap-angular/core'
import { MaterialModule } from '../../../../@shared/index'
import { SelectionService } from '../domain'
import { XpertStudioComponent } from '../studio.component'
import { XpertStudioPanelAgentComponent } from './xpert-agent/agent.component'
import { IfAnimation } from 'apps/cloud/src/app/@core'

@Component({
  selector: 'xpert-studio-panel',
  standalone: true,
  imports: [CommonModule, CdkMenuModule, MaterialModule, DensityDirective, XpertStudioPanelAgentComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  animations: [
    IfAnimation
  ]
})
export class XpertStudioPanelComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly selectionService = inject(SelectionService)

  readonly visible = model(false)

  readonly selectedNode = toSignal(this.selectionService.singleNode$)
  // readonly entity = computed(() => {
  //   const selectedNode = this.selectedNode()
  //   if (selectedNode?.type === 'agent') {
  //     return selectedNode.entity
  //   }
  //   return null
  // })
  
  private singleNodeSub = this.selectionService.singleNode$.pipe(takeUntilDestroyed()).subscribe((node) => {
    if (!node) {
      this.close()
    }
  })

  constructor() {
    effect(() => {
      console.log(`Panel visible:`,this.visible())
    })
  }

  close() {
    this.visible.set(false)
  }
}
