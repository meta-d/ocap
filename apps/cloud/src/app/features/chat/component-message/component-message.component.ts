import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmCommonModule } from '@metad/ocap-angular/common'
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
    NxWidgetKpiComponent
  ],
  selector: 'pac-chat-component-message',
  templateUrl: './component-message.component.html',
  styleUrl: 'component-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponentMessageComponent {
  readonly #store = inject(Store)
  readonly chatService = inject(ChatService)

  readonly message = input<CopilotChatMessage>()

  readonly data = computed(() => this.message()?.data as any)

  readonly primaryTheme = toSignal(this.#store.primaryTheme$)

  readonly chartSettings = computed(() => {
    return {
      ...(this.data()?.chartSettings ?? {}),
      theme: this.primaryTheme()
    }
  })
}
