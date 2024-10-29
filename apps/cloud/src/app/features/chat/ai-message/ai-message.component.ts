import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CopilotBaseMessage, CopilotChatMessage, isMessageGroup } from '@metad/copilot'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import { MaterialModule } from '../../../@shared'
import { ChatLoadingComponent } from '../../../@shared/copilot'
import { ChatService } from '../chat.service'
import { ChatComponentMessageComponent } from '../component-message/component-message.component'
import { EmojiAvatarComponent } from '../../../@shared/avatar'

interface ICopilotChatMessage extends CopilotChatMessage {
  expanded: boolean
  messages: CopilotChatMessage[]
  data: any[]
}

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
    CdkMenuModule,
    MarkdownModule,
    MaterialModule,
    NgmCommonModule,
    EmojiAvatarComponent,
    ChatLoadingComponent,
    ChatComponentMessageComponent
  ],
  selector: 'pac-ai-message',
  templateUrl: './ai-message.component.html',
  styleUrl: 'ai-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatAiMessageComponent {
  readonly chatService = inject(ChatService)

  readonly message = input<CopilotBaseMessage>()
  readonly #content = computed(() => {
    const content = this.message()?.content
    if (content) {
      const count = (content.match(/```/g) || []).length
      if (count % 2 === 0) {
        return content
      } else {
        return content + '\n```\n'
      }
    }
    return ''
  })
  readonly content = computed(() => {
    const content = this.#content()
    if (['thinking', 'answering'].includes(this.message().status) && this.answering()) {
      return content + '<span class="thinking-placeholder"></span>'
    }
    return content
  })

  readonly role = this.chatService.role
  readonly answering = this.chatService.answering

  readonly messageGroup = computed(() => {
    const message = this.message()
    return isMessageGroup<ICopilotChatMessage>(message) ? message : null
  })

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }
}
