import { CommonModule } from '@angular/common'
import { computeMsgId } from '@angular/compiler'
import { Component, computed, input } from '@angular/core'

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'copilot-message-tool-call',
  templateUrl: 'tool-call.component.html',
  styleUrls: ['tool-call.component.scss']
})
export class CopilotMessageToolCallComponent {
  readonly toolCall = input<{
    name: string
    args: {
      input: string
    }
    id: string
    type: string
  }>()

  readonly args = computed(() => {
    const args = this.toolCall()?.args
    return typeof args === 'string' ? args : JSON.stringify(args)
  })
}
