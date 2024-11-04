import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { IXpertToolset, TXpertTeamNode, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertStudioPanelComponent } from '../panel.component'
import { CloseSvgComponent } from '@metad/ocap-angular/common'
import { of, switchMap } from 'rxjs'
import { derivedAsync } from 'ngxtension/derived-async'
import { XpertToolsetToolTestComponent } from '../../../tools'

@Component({
  selector: 'xpert-studio-panel-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, CloseSvgComponent, EmojiAvatarComponent, XpertToolsetToolTestComponent],
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


  closePanel() {
    this.panelComponent.close()
  }
}
