import { CommonModule } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import { StoredMessage } from '@langchain/core/messages'
import { MarkdownModule } from 'ngx-markdown'
import { CopilotMessageContentComponent } from '../message-content/content.component'
import { CopilotMessageToolCallComponent } from '../tool-call/tool-call.component'

@Component({
  standalone: true,
  imports: [CommonModule, MarkdownModule, CopilotMessageContentComponent, CopilotMessageToolCallComponent],
  selector: 'copilot-stored-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.scss']
})
export class CopilotStoredMessageComponent {
  readonly message = input<StoredMessage>()

  readonly content = computed(() => {
    return this.message()?.data.content
  })

  readonly toolCalls = computed(() => (<any>this.message()?.data).tool_calls)

  readonly toolMessage = computed(() => {
    return this.message()?.data
  })
  readonly toolResponse = computed(() => {
    const content = this.toolMessage()?.content
    return content
  })
}
