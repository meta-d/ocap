import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { FFlowModule } from '@foblex/flow'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { TXpertTeamNode, XpertAgentExecutionEnum, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { derivedAsync } from 'ngxtension/derived-async'
import { of } from 'rxjs'
import { XpertExecutionService } from '../../services/execution.service'

@Component({
  selector: 'xpert-studio-node-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, EmojiAvatarComponent, NgmSpinComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioNodeToolsetComponent {
  eXpertAgentExecutionEnum = XpertAgentExecutionEnum
  
  readonly elementRef = inject(ElementRef)
  readonly toolsetService = inject(XpertToolsetService)
  readonly executionService = inject(XpertExecutionService)

  readonly node = input<TXpertTeamNode>()
  readonly toolset = computed(() => this.node().entity)

  readonly toolsetDetail = derivedAsync(() => {
    return this.toolset() ? this.toolsetService.getOneById(this.toolset().id, { relations: ['tools']}) : of(null)
  })

  readonly availableTools = computed(() => this.toolsetDetail()?.tools.filter((_) => _.enabled))

  readonly toolExecutions = this.executionService.toolExecutions

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
  }
}
