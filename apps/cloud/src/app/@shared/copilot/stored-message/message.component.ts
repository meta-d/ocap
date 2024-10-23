import { CommonModule } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import { StoredMessage } from '@langchain/core/messages'
import { CopilotMessageContentComponent } from '../message-content/content.component'

@Component({
  standalone: true,
  imports: [CommonModule, CopilotMessageContentComponent],
  selector: 'copilot-stored-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.scss']
})
export class CopilotStoredMessageComponent {
  readonly message = input<StoredMessage>()

  readonly content = computed(() => {
    return this.message()?.data.content
  })

  readonly toolMessage = computed(() => {
    return this.message()?.data
  })
  readonly toolResponse = computed(() => {
    const content = this.toolMessage()?.content
    return content
  })
}
