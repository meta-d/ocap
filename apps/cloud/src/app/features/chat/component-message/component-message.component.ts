import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NgmSelectionModule, SlicersCapacity } from '@metad/ocap-angular/selection'
import { ISlicer } from '@metad/ocap-core'
import { NxWidgetKpiComponent } from '@metad/story/widgets/kpi'
import { TranslateModule } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import { Store } from '../../../@core'
import { MaterialModule } from '../../../@shared'
import { ChatLoadingComponent } from '../../../@shared/copilot'
import { AvatarComponent } from '../../../@shared/files/'
import { ChatService } from '../chat.service'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    RouterModule,
    TranslateModule,
    MarkdownModule,
    MaterialModule,
    NgmCommonModule,
    AvatarComponent,
    ChatLoadingComponent,
    AnalyticalCardModule,
    NgmSelectionModule,
    NxWidgetKpiComponent
  ],
  selector: 'pac-chat-component-message',
  templateUrl: './component-message.component.html',
  styleUrl: 'component-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponentMessageComponent {
  SlicersCapacity = SlicersCapacity

  readonly #store = inject(Store)
  readonly chatService = inject(ChatService)

  readonly message = input<CopilotChatMessage>()

  readonly data = computed(() => this.message()?.data as any)
  readonly _slicers = model<ISlicer[]>([])
  readonly slicers = computed(() =>
    this._slicers() ?? this.data()?.slicers
  )

  readonly primaryTheme = toSignal(this.#store.primaryTheme$)

  readonly chartSettings = computed(() => {
    return {
      ...(this.data()?.chartSettings ?? {}),
      theme: this.primaryTheme()
    }
  })

  updateSlicers(slicers: ISlicer[]) {
    this._slicers.set(slicers)
  }
}
