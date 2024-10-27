import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { FFlowModule } from '@foblex/flow'
import { NgmHighlightVarDirective } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import {
  ICopilotModel,
  IfAnimation,
  IXpertAgent,
  IXpertAgentExecution,
  LanguagesEnum,
  ModelType,
  XpertAgentExecutionService,
  XpertService
} from 'apps/cloud/src/app/@core'
import { CopilotModelSelectComponent, MaterialModule, XpertAvatarComponent } from 'apps/cloud/src/app/@shared'
import { AppService } from 'apps/cloud/src/app/app.service'
import { XpertStudioApiService } from '../../domain'
import { XpertStudioPanelAgentExecutionComponent } from '../agent-execution/execution.component'
import { XpertStudioPanelComponent } from '../panel.component'
import { XpertStudioPanelRoleToolsetComponent } from './toolset/toolset.component'
import { derivedAsync } from 'ngxtension/derived-async'
import { map } from 'rxjs'
import { CdkMenuModule } from '@angular/cdk/menu'

@Component({
  selector: 'xpert-studio-panel-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CdkMenuModule,
    FFlowModule,
    MaterialModule,
    FormsModule,
    TranslateModule,

    XpertAvatarComponent,
    NgmHighlightVarDirective,
    XpertStudioPanelRoleToolsetComponent,
    CopilotModelSelectComponent,
    XpertStudioPanelAgentExecutionComponent
  ],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
    '(contextmenu)': 'emitSelectionChangeEvent($event)'
  },
  animations: [IfAnimation]
})
export class XpertStudioPanelAgentComponent {
  eModelType = ModelType

  readonly regex = `{{(.*?)}}`
  readonly elementRef = inject(ElementRef)
  readonly appService = inject(AppService)
  readonly apiService = inject(XpertStudioApiService)
  readonly xpertService = inject(XpertService)
  readonly executionService = inject(XpertAgentExecutionService)
  readonly panelComponent = inject(XpertStudioPanelComponent)

  readonly key = input<string>()
  readonly nodes = computed(() => this.apiService.viewModel()?.nodes)
  readonly node = computed(() => this.nodes()?.find((_) => _.key === this.key()))
  readonly xpertAgent = computed(() => this.node()?.entity as IXpertAgent)
  readonly promptInputElement = viewChild('editablePrompt', { read: ElementRef<HTMLDivElement> })

  readonly xpert = computed(() => this.apiService.viewModel()?.team)
  readonly xpertId = computed(() => this.xpert()?.id)
  readonly xpertCopilotModel = computed(() => this.xpert()?.copilotModel)
  readonly toolsets = computed(() => this.xpertAgent()?.toolsets)
  readonly name = computed(() => this.xpertAgent()?.name)
  readonly title = computed(() => this.xpertAgent()?.title)
  readonly prompt = model<string>()
  readonly promptLength = computed(() => this.prompt()?.length)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  readonly nameError = computed(() => {
    const name = this.name()
    return this.nodes()
      .filter((_) => _.key !== this.key())
      .some((n) => n.entity.name === name)
  })

  readonly copilotModel = model<ICopilotModel>()

  readonly openedExecution = signal(false)
  readonly execution = model<IXpertAgentExecution>(null)

  // App states
  readonly isEnglish = computed(() => {
    return ![LanguagesEnum.Chinese, LanguagesEnum.SimplifiedChinese, LanguagesEnum.TraditionalChinese].includes(
      this.appService.lang()
    )
  })

  readonly executions = derivedAsync(() => {
    const xpertId = this.xpertId()
    const agentKey = this.key()
    return this.executionService.findAllByXpertAgent(xpertId, agentKey, {}).pipe(
      map(({items}) => items)
    )
  })

  constructor() {
    effect(
      () => {
        if (this.xpertAgent()) {
          this.prompt.set(this.xpertAgent().prompt)
          this.copilotModel.set(this.xpertAgent().copilotModel)
        }
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      console.log(`copilotModel:`, this.name(), this.nameError())
    })
  }

  onNameChange(event: string) {
    this.apiService.updateXpertAgent(this.key(), { name: event }, { emitEvent: false })
  }
  onTitleChange(event: string) {
    this.apiService.updateXpertAgent(
      this.key(),
      {
        title: event
      },
      { emitEvent: false }
    )
  }
  onDescChange(event: string) {
    this.apiService.updateXpertAgent(this.key(), { description: event }, { emitEvent: false })
  }
  onBlur() {
    this.apiService.reload()
  }
  onPromptChange() {
    const text = this.promptInputElement().nativeElement.textContent
    this.prompt.set(text)
    this.apiService.updateXpertAgent(this.key(), { prompt: text })
  }

  updateCopilotModel(model: ICopilotModel) {
    this.apiService.updateXpertAgent(this.key(), { copilotModel: model })
  }

  openExecution(execution?: IXpertAgentExecution) {
    this.execution.set(execution)
    this.openedExecution.set(true)
  }
  closeExecution() {
    this.openedExecution.set(false)
  }

  closePanel() {
    this.panelComponent.close()
  }
}
