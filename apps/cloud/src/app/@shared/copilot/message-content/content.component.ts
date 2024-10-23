import { CommonModule } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import { MessageContent, MessageContentComplex } from '@langchain/core/messages'
import { MarkdownModule } from 'ngx-markdown'

@Component({
  standalone: true,
  imports: [CommonModule, MarkdownModule,],
  selector: 'copilot-message-content',
  templateUrl: 'content.component.html',
  styleUrls: ['content.component.scss']
})
export class CopilotMessageContentComponent {
  readonly content = input<MessageContent>()

  readonly contents = computed(() => {
    const content = this.content()
    const items: MessageContentComplex[] = []
    if (typeof content === 'string') {
      items.push({
        text: content,
        type: 'text'
      })
    } else if (Array.isArray(content)) {
      items.push(...content)
    }
    return items
  })
}
