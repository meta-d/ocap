import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import { Component, computed, DestroyRef, effect, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
  ChatConversationService,
  ChatMessageEventTypeEnum,
  ChatMessageTypeEnum,
  CopilotChatMessage,
  ToastrService,
  uuid,
  XpertAgentExecutionEnum,
  XpertService
} from 'apps/cloud/src/app/@core'
import { MaterialModule, XpertParametersCardComponent } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { MarkdownModule } from 'ngx-markdown'
import { XpertStudioApiService } from '../../domain'
import { XpertExecutionService } from '../../services/execution.service'
import { XpertStudioComponent } from '../../studio.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TextFieldModule,
    MarkdownModule,
    EmojiAvatarComponent,
    XpertParametersCardComponent
  ],
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

  readonly xpert = this.studioComponent.xpert
  readonly parameters = computed(() => this.apiService.primaryAgent()?.parameters)
  readonly avatar = computed(() => this.xpert()?.avatar)
  readonly input = model<string>()
  readonly loading = signal(false)

  readonly output = signal('')

  readonly conversation = this.executionService.conversation

  readonly lastMessage = signal<CopilotChatMessage>(null)
  readonly messages = computed(() => {
    if (this.lastMessage()) {
      return [...this.executionService.messages(), this.lastMessage()]
    }
    return this.executionService.messages()
  })

  constructor() {
    // effect(() => {
    //   console.log(this.parameters(), this.apiService.primaryAgent())
    // })
  }

  chat(input: string) {
    this.loading.set(true)

    // Add to user message
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
        input: { input },
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
              if (event.type === ChatMessageTypeEnum.MESSAGE) {
                // Update last AI message
                this.output.update((state) => state + event.data)
                this.lastMessage.update((message) => ({
                  ...message,
                  content: message.content + event.data
                }))
              } else if (event.type === ChatMessageTypeEnum.EVENT) {
                switch(event.event) {
                  case ChatMessageEventTypeEnum.ON_TOOL_START: {
                    this.executionService.setToolExecution(event.data.name, {status: XpertAgentExecutionEnum.RUNNING})
                    break;
                  }
                  case ChatMessageEventTypeEnum.ON_TOOL_END: {
                    this.executionService.setToolExecution(event.data.name, {status: XpertAgentExecutionEnum.SUCCEEDED})
                    break;
                  }
                  case ChatMessageEventTypeEnum.ON_AGENT_START:
                  case ChatMessageEventTypeEnum.ON_AGENT_END: {
                    this.executionService.setAgentExecution(event.data.agentKey, event.data)
                    break;
                  }
                  default: {
                    console.log(`未处理的事件：`, event)
                  }
                }
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
