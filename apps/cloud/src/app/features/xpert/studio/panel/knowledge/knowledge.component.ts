import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { TXpertTeamNode } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertStudioPanelComponent } from '../panel.component'
import { CloseSvgComponent } from '@metad/ocap-angular/common'

@Component({
  selector: 'xpert-studio-panel-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ MatIcon, CloseSvgComponent, EmojiAvatarComponent],
  host: {
    tabindex: '-1',
  }
})
export class XpertStudioPanelKnowledgeComponent {
  readonly elementRef = inject(ElementRef)
  readonly panelComponent = inject(XpertStudioPanelComponent)

  readonly node = input<TXpertTeamNode>()
  readonly knowledge = computed(() => this.node().entity)

  closePanel() {
    this.panelComponent.close()
  }
}
