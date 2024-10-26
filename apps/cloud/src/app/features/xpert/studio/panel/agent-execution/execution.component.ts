import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { FFlowModule } from '@foblex/flow'
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
import { NgmIsNilPipe } from '@metad/ocap-angular/core'
import { XpertStudioApiService } from '../../domain'
import { XpertStudioComponent } from '../../studio.component'

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
    NgmIsNilPipe,
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
  readonly studioComponent = inject(XpertStudioComponent)
  readonly #toastr = inject(ToastrService)
  readonly #destroyRef = inject(DestroyRef)
  

  readonly xpert = input<IXpert>()
  readonly xpertAgent = input<IXpertAgent>()

  readonly input = model<string>(null)

  readonly output = signal('')
  readonly execution = signal<IXpertAgentExecution>(null)
  readonly executions = computed(() => {
    const executions: IXpertAgentExecution[] = []
    if (this.execution()) {
      executions.push({
        ...this.execution(),
        agent: this.getAgent(this.execution().agentKey)
      })
      this.execution().subExecutions?.forEach((execution) => {
        executions.push({
          ...execution,
          agent: this.getAgent(execution.agentKey)
        })
      })
    }
    return executions
  })

  readonly loading = signal(false)

  constructor() {
    // register a destroy callback
    this.#destroyRef.onDestroy(() => {
      this.clearStatus()
    })
  }

  clearStatus() {
    this.output.set('')
    this.execution.set(null)
    this.studioComponent.agentExecutions.set({})
  }

  startRunAgent() {
    this.loading.set(true)
    // Clear
    this.clearStatus()

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
                this.studioComponent.agentExecutions.update((state) => ({
                  ...state,
                  [event.data.agentKey]: event.data
                }))
              } else if (event.type === 'event') {
                this.studioComponent.agentExecutions.update((state) => ({
                  ...state,
                  [event.data.agentKey]: event.data
                }))
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

  getAgent(key: string): IXpertAgent {
    return this.apiService.getNode(key)?.entity as IXpertAgent
  }

}
