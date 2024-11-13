import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenu, CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, model } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { FFlowModule } from '@foblex/flow'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IXpertToolset, XpertToolsetCategoryEnum } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from '../../../../../@shared/avatar/emoji-avatar/avatar.component'
import { XpertStudioApiService } from '../../domain'
import { XpertStudioComponent } from '../../studio.component'

@Component({
  selector: 'xpert-studio-toolset-menu',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FFlowModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    CdkMenuModule,
    CdkListboxModule,
    EmojiAvatarComponent,
    NgmI18nPipe
  ],
  host: {
    tabindex: '-1'
  }
})
export class XpertStudioToolsetMenuComponent {
  readonly elementRef = inject(ElementRef)
  readonly cdkMenu = inject(CdkMenu)
  private root = inject(XpertStudioComponent)
  readonly apiService = inject(XpertStudioApiService)

  readonly TYPES = [
    {
      value: null,
      label: '全部'
    },
    {
      value: XpertToolsetCategoryEnum.BUILTIN,
      label: '内置'
    },
    {
      value: XpertToolsetCategoryEnum.API,
      label: '自定义'
    }
  ]

  readonly #toolsets = toSignal(this.apiService.toolsets$)

  readonly toolsets = computed(() => {
    return this.#toolsets()?.filter((_) => (this.type()[0] ? this.type().includes(_.category) : true))
  })

  readonly type = model<(XpertToolsetCategoryEnum | 'command')[]>([null])

  public createToolset(toolset: IXpertToolset): void {
    this.cdkMenu.menuStack.closeAll()
    this.apiService.createToolset(this.root.contextMenuPosition, toolset)
  }
}
