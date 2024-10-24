import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { FFlowModule } from '@foblex/flow'
import { StoredMessage } from '@langchain/core/messages'
import { NgmHighlightVarDirective } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import {
  getErrorMessage,
  IXpert,
  IXpertAgent,
  IXpertAgentExecution,
  ToastrService,
  XpertAgentExecutionEnum,
  XpertAgentService
} from 'apps/cloud/src/app/@core'
import {
  CopilotModelSelectComponent,
  CopilotStoredMessageComponent,
  MaterialModule,
  XpertAvatarComponent
} from 'apps/cloud/src/app/@shared'
import { MarkdownModule } from 'ngx-markdown'
import { XpertStudioApiService } from '../../domain'

@Component({
  selector: 'xpert-studio-panel-agent-execution',
  templateUrl: './execution.component.html',
  styleUrls: ['./execution.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FFlowModule,
    MaterialModule,
    FormsModule,
    TranslateModule,
    MarkdownModule,
    XpertAvatarComponent,
    NgmHighlightVarDirective,
    CopilotModelSelectComponent,
    CopilotStoredMessageComponent
  ],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected'
  }
})
export class XpertStudioPanelAgentExecutionComponent {
  eXpertAgentExecutionEnum = XpertAgentExecutionEnum

  readonly xpertAgentService = inject(XpertAgentService)
  readonly apiService = inject(XpertStudioApiService)
  readonly #toastr = inject(ToastrService)

  readonly xpert = input<IXpert>()
  readonly xpertAgent = input<IXpertAgent>()

  readonly input = model<string>(null)

  readonly output = signal('')
  readonly execution = signal<IXpertAgentExecution>(null)
  readonly storedMessages = computed(() => {
    if (this.execution()) {
      const messages: StoredMessage[] = [...(this.execution().messages ?? [])]
      this.execution().subExecutions.forEach((execution) => {
        if (execution.messages) {
          messages.push(...execution.messages)
        }
      })
      return messages
    }
    return null
  })

  readonly loading = signal(false)

  constructor() {
    effect(() => {
      console.log(this.execution())
    })
  }

  startRunAgent() {
    this.loading.set(true)
    // Clear
    this.output.set('')
    this.execution.set(null)
    // Call chat server
    this.xpertAgentService
      .chatAgent({
        input: this.input(),
        agent: this.xpertAgent(),
        xpert: this.xpert()
      })
      .subscribe({
        next: (msg) => {
          if (msg.event === 'error') {
            this.#toastr.error(msg.data)
          } else {
            if (msg.data) {
              const event = JSON.parse(msg.data)
              if (event.type === 'message') {
                this.output.update((state) => state + event.data)
              } else if (event.type === 'log') {
                this.execution.set(event.data)
              }
            }
          }
        },
        error: (error) => {
          this.#toastr.error(getErrorMessage(error))
          this.loading.set(false)
        },
        complete: () => {
          this.loading.set(false)
        }
      })
  }
}
