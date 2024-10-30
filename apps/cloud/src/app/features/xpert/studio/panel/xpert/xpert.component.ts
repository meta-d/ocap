import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { TXpertTeamNode } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertStudioPanelComponent } from '../panel.component'
import { CloseSvgComponent } from '@metad/ocap-angular/common'

@Component({
  selector: 'xpert-studio-panel-xpert',
  templateUrl: './xpert.component.html',
  styleUrls: ['./xpert.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, CloseSvgComponent, EmojiAvatarComponent],
  host: {
    tabindex: '-1',
  }
})
export class XpertStudioPanelXpertComponent {
  readonly elementRef = inject(ElementRef)
  readonly panelComponent = inject(XpertStudioPanelComponent)

  readonly node = input<TXpertTeamNode>()
  readonly xpert = computed(() => this.node().entity)

  closePanel() {
    this.panelComponent.close()
  }
}
