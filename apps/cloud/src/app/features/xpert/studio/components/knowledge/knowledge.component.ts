import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { FFlowModule } from '@foblex/flow'
import { TXpertTeamNode } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertExecutionService } from '../../services/execution.service'

@Component({
  selector: 'xpert-studio-node-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, EmojiAvatarComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '[class]': 'status()',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioNodeKnowledgeComponent {
  readonly elementRef = inject(ElementRef)
  readonly executionService = inject(XpertExecutionService)

  readonly node = input<TXpertTeamNode>()
  readonly id = computed(() => this.node()?.key)
  readonly knowledge = computed(() => this.node().entity)

  readonly execution = computed(() => this.executionService.knowledgeExecutions()?.[this.id()])
  readonly status = computed(() => this.execution()?.status)
  
  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
  }
}
