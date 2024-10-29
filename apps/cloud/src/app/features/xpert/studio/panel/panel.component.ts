import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, effect, inject, model } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { IfAnimation } from 'apps/cloud/src/app/@core'
import { MaterialModule } from '../../../../@shared/index'
import { SelectionService } from '../domain'
import { XpertStudioComponent } from '../studio.component'
import { XpertStudioPreviewComponent } from './preview/preview.component'
import { XpertStudioPanelAgentComponent } from './xpert-agent/agent.component'

@Component({
  selector: 'xpert-studio-panel',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    MaterialModule,
    XpertStudioPanelAgentComponent,
    XpertStudioPreviewComponent
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  animations: [IfAnimation]
})
export class XpertStudioPanelComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly selectionService = inject(SelectionService)

  // readonly visible = model(true)
  readonly preview = model(false)

  readonly selectedNode = toSignal(this.selectionService.singleNode$)

  private singleNodeSub = this.selectionService.singleNode$.pipe(takeUntilDestroyed()).subscribe((node) => {
    if (!node) {
      this.close()
    }
  })

  constructor() {
    effect(() => {
      console.log(`Panel selectedNode:`, this.selectedNode())
    })
  }

  close() {
    // this.visible.set(false)
  }
}
