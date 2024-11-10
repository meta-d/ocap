import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { IXpertToolset, TXpertTeamNode, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertStudioPanelComponent } from '../panel.component'
import { CloseSvgComponent } from '@metad/ocap-angular/common'
import { of } from 'rxjs'
import { derivedAsync } from 'ngxtension/derived-async'
import { sortBy } from 'lodash-es'
import { XpertToolTestComponent } from '../../../tools'

@Component({
  selector: 'xpert-studio-panel-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CloseSvgComponent, EmojiAvatarComponent, XpertToolTestComponent],
})
export class XpertStudioPanelToolsetComponent {
  readonly elementRef = inject(ElementRef)
  readonly panelComponent = inject(XpertStudioPanelComponent)
  readonly toolsetService = inject(XpertToolsetService)

  readonly node = input<TXpertTeamNode>()
  readonly toolsetId = computed(() => this.node()?.key)

  readonly toolset = derivedAsync(() =>
    this.toolsetId() ? this.toolsetService.getOneById(this.toolsetId(), { relations: ['tools'] }) : of(null)
  , { initialValue: this.node()?.entity as IXpertToolset})

  readonly tools = computed(() => this.toolset()?.tools.filter((_) => _.enabled).reverse())

  closePanel() {
    this.panelComponent.close()
  }
}
