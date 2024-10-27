import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import { Component, computed, DestroyRef, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
  ChatConversationService,
  ChatEventTypeEnum,
  CopilotChatMessage,
  ToastrService,
  uuid,
  XpertService
} from 'apps/cloud/src/app/@core'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { MarkdownModule } from 'ngx-markdown'
import { XpertStudioApiService } from '../../domain'
import { XpertExecutionService } from '../../services/execution.service'
import { XpertStudioComponent } from '../../studio.component'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TextFieldModule, MarkdownModule],
  selector: 'xpert-studio-panel-preview',
  templateUrl: 'preview.component.html',
  styleUrls: ['preview.component.scss']
})
export class XpertStudioPreviewComponent {
  readonly xpertService = inject(XpertService)
  readonly apiService = inject(XpertStudioApiService)
  readonly executionService = inject(XpertExecutionService)
  readonly conversationService = inject(ChatConversationService)
  readonly studioComponent = inject(XpertStudioComponent)
  readonly #toastr = inject(ToastrService)
  readonly #destroyRef = inject(DestroyRef)

  readonly envriments = signal(false)

  readonly xpert = this.apiService.team
  readonly input = model<string>()
  readonly loading = signal(false)

  readonly output = signal('')

  readonly conversation = this.executionService.conversation

  // readonly #messages = computed(() => {
  //   const conversation = this.executionService.conversation()
  //   return conversation?.messages ?? []
  // }) // signal<CopilotChatMessage[]>([])

  readonly lastMessage = signal<CopilotChatMessage>(null)
  readonly messages = computed(() => {
    if (this.lastMessage()) {
      return [...this.executionService.messages(), this.lastMessage()]
    }
    return this.executionService.messages()
  })

  chat(input: string) {
    this.loading.set(true)

    // Add to user message
    // this.#messages.update((messages) => [...messages, {
    //   role: 'user',
    //   content: input,
    //   id: uuid()
    // }])
    this.executionService.appendMessage({
      role: 'user',
      content: input,
      id: uuid()
    })
    this.input.set('')
    this.lastMessage.set({
      id: uuid(),
      role: 'assistant',
      content: '',
      status: 'thinking'
    })

    // Send to server chat
    this.xpertService
      .chat(this.xpert().id, {
        input,
        draft: true,
        conversationId: this.conversation()?.id
      })
      .subscribe({
        next: (msg) => {
          if (msg.event === 'error') {
            this.#toastr.error(msg.data)
          } else {
            if (msg.data) {
              const event = JSON.parse(msg.data)
              if (event.type === ChatEventTypeEnum.MESSAGE) {
                // Update last AI message
                this.output.update((state) => state + event.data)
                this.lastMessage.update((message) => ({
                  ...message,
                  content: message.content + event.data
                }))
              } else if (event.type === ChatEventTypeEnum.LOG) {
                this.executionService.setAgentExecution(event.data.agentKey, event.data)
              } else if (event.type === ChatEventTypeEnum.EVENT) {
                this.executionService.setAgentExecution(event.data.agentKey, event.data)
              }
            }
          }
        },
        error: (err) => {
          console.error(err)
          this.loading.set(false)
          this.executionService.appendMessage(this.lastMessage())
          this.lastMessage.set(null)
        },
        complete: () => {
          this.loading.set(false)
          this.executionService.appendMessage(this.lastMessage())
          this.lastMessage.set(null)
        }
      })
  }

  restart() {
    this.executionService.setConversation(null)
  }

  close() {
    this.studioComponent.preview.set(false)
  }
}
