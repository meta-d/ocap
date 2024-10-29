import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatIcon } from '@angular/material/icon'
import { FFlowModule } from '@foblex/flow'
import { IXpertToolset } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from '../../../../../@shared/avatar/emoji-avatar/avatar.component'
import { XpertStudioApiService } from '../../domain'
import { XpertStudioComponent } from '../../studio.component'

@Component({
  selector: 'xpert-studio-toolset-menu',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FFlowModule, MatIcon, CdkMenuModule, EmojiAvatarComponent],
  host: {
    tabindex: '-1'
  }
})
export class XpertStudioToolsetMenuComponent {
  readonly elementRef = inject(ElementRef)
  readonly cdkMenu = inject(CdkMenu)
  private root = inject(XpertStudioComponent)
  readonly apiService = inject(XpertStudioApiService)

  readonly toolsets = toSignal(this.apiService.toolsets$)

  public createToolset(toolset: IXpertToolset): void {
    this.cdkMenu.menuStack.closeAll()
    this.apiService.createToolset(this.root.contextMenuPosition, toolset)
  }
}
