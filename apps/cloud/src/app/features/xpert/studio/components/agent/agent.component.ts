import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { XpertStudioRoleToolsetComponent } from './toolset/toolset.component'
import { AvatarComponent } from 'apps/cloud/src/app/@shared'
import { TXpertTeamNode } from 'apps/cloud/src/app/@core'

@Component({
  selector: 'xpert-studio-node-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, AvatarComponent, XpertStudioRoleToolsetComponent],
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
  readonly xpertRole = computed(() => this.node().entity)

  readonly toolsets = computed(() => this.xpertRole()?.toolsets)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
  }
}
