import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { XpertStudioRoleToolsetComponent } from './toolset/toolset.component'
import { TXpertTeamNode } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'

@Component({
  selector: 'xpert-studio-node-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, EmojiAvatarComponent, XpertStudioRoleToolsetComponent],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  }
})
export class XpertStudioNodeAgentComponent {
  readonly elementRef = inject(ElementRef)

  readonly node = input<TXpertTeamNode & {type: 'agent'}>()
  readonly isRoot = input<boolean>(false)
  readonly xpertAgent = computed(() => this.node().entity)

  readonly toolsets = computed(() => this.xpertAgent()?.toolsets)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
  }
}
