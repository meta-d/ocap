import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CopilotBaseMessage, isMessageGroup } from '@metad/copilot'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import { MaterialModule } from '../../../@shared'
import { AvatarComponent } from '../../../@shared/files/avatar/avatar.component'
import { ChatService } from '../chat.service'
import { ChatLoadingComponent } from '../../../@shared/copilot'
import { ChatComponentMessageComponent } from '../component-message/component-message.component'

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
  readonly content = computed(() => this.message()?.content)

  readonly role = this.chatService.role
  readonly answering = this.chatService.answering

  readonly messageGroup = computed(() => {
    const message = this.message()
    return isMessageGroup(message) ? message : null
  })

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }
}
