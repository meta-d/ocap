import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  signal
} from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { FFlowModule } from '@foblex/flow'
import { NgmHighlightVarDirective } from '@metad/ocap-angular/common'
import { NgmIsNilPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import {
  ChatEventTypeEnum,
  getErrorMessage,
  IXpert,
  IXpertAgent,
  IXpertAgentExecution,
  ToastrService,
  XpertAgentExecutionEnum,
  XpertAgentExecutionService,
  XpertAgentService
} from 'apps/cloud/src/app/@core'
import {
  CopilotModelSelectComponent,
  CopilotStoredMessageComponent,
  MaterialModule,
  XpertParametersCardComponent
} from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { MarkdownModule } from 'ngx-markdown'
import { of } from 'rxjs'
import { distinctUntilChanged, switchMap } from 'rxjs/operators'
import { XpertAgentExecutionComponent } from '../../../../../@shared/'
import { XpertStudioApiService } from '../../domain'
import { XpertExecutionService } from '../../services/execution.service'
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
    EmojiAvatarComponent,
    NgmHighlightVarDirective,
    CopilotModelSelectComponent,
    CopilotStoredMessageComponent,
    XpertAgentExecutionComponent,
    XpertParametersCardComponent
  ],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected'
  }
})
export class XpertStudioPanelAgentExecutionComponent {
  eXpertAgentExecutionEnum = XpertAgentExecutionEnum

  readonly xpertAgentService = inject(XpertAgentService)
  readonly agentExecutionService = inject(XpertAgentExecutionService)
  readonly apiService = inject(XpertStudioApiService)
  readonly executionService = inject(XpertExecutionService)
  readonly studioComponent = inject(XpertStudioComponent)
  readonly #toastr = inject(ToastrService)
  readonly #destroyRef = inject(DestroyRef)

  readonly executionId = input<string>()
  readonly xpert = input<Partial<IXpert>>()
  readonly xpertAgent = input<IXpertAgent>()
  readonly execution = this.executionService.execution
  readonly parameters = computed(() => this.xpertAgent().parameters)

  readonly parameterValue = model<Record<string, unknown>>()
  readonly input = model<string>(null)

  readonly output = signal('')
  // readonly execution = signal<IXpertAgentExecution>(null)
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

  private executionSub = toObservable(this.executionId)
    .pipe(
      distinctUntilChanged(),
      switchMap((id) => (id ? this.agentExecutionService.getOneLog(id) : of(null)))
    )
    .subscribe((value) => {
      this.execution.set(value)
      this.output.set(value.outputs?.output)
    })

  constructor() {
    // register a destroy callback
    this.#destroyRef.onDestroy(() => {
      this.clearStatus()
    })

    // effect(() => {
    //   console.log(this.parameterValue(), this.input())
    // })
  }

  clearStatus() {
    this.output.set('')
    this.execution.set(null)
    this.executionService.setConversation(null)
  }

  startRunAgent() {
    this.loading.set(true)
    // Clear
    this.clearStatus()

    // Call chat server
    this.xpertAgentService
      .chatAgent({
        input: {
          ...(this.parameterValue() ?? {}),
          input: this.input()
        },
        agent: this.xpertAgent(),
        xpert: this.xpert(),
        executionId: this.executionId()
      })
      .subscribe({
        next: (msg) => {
          if (msg.event === 'error') {
            this.#toastr.error(msg.data)
          } else {
            if (msg.data) {
              const event = JSON.parse(msg.data)
              if (event.type === ChatEventTypeEnum.MESSAGE) {
                this.output.update((state) => state + event.data)
              } else if (event.type === ChatEventTypeEnum.LOG) {
                this.execution.set(event.data)
                this.executionService.setAgentExecution(event.data.agentKey, event.data)
              } else if (event.type === ChatEventTypeEnum.EVENT) {
                switch(event.event) {
                  case 'on_tool_start': {
                    this.executionService.setToolExecution(event.data.name, {status: XpertAgentExecutionEnum.RUNNING})
                    break;
                  }
                  case 'on_tool_end': {
                    this.executionService.setToolExecution(event.data.name, {status: XpertAgentExecutionEnum.SUCCEEDED})
                    break;
                  }
                  default: {
                    this.executionService.setAgentExecution(event.data.agentKey, event.data)
                  }
                }
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
