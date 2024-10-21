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
import { ICopilotModel, IfAnimation, IXpertAgent, ModelType, XpertRoleService } from 'apps/cloud/src/app/@core'
import { XpertAvatarComponent, MaterialModule, CopilotModelSelectComponent } from 'apps/cloud/src/app/@shared'
import { derivedAsync } from 'ngxtension/derived-async'
import { map } from 'rxjs'
import { XpertStudioApiService } from '../../domain'
import { XpertStudioPanelRoleToolsetComponent } from './toolset/toolset.component'
import { XpertStudioPanelAgentExecutionComponent } from '../agent-execution/execution.component'


@Component({
  selector: 'xpert-studio-panel-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
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
  animations: [
    IfAnimation
  ]
})
export class XpertStudioPanelAgentComponent {
  eModelType = ModelType
  readonly regex = `{{(.*?)}}`
  readonly elementRef = inject(ElementRef)
  readonly apiService = inject(XpertStudioApiService)
  readonly xpertService = inject(XpertRoleService)

  readonly key = input<string>()
  readonly xpertAgent = input<IXpertAgent>()
  readonly promptInputElement = viewChild('editablePrompt', { read: ElementRef<HTMLDivElement> })

  readonly xpert = computed(() => this.apiService.viewModel()?.team)
  readonly xpertCopilotModel = computed(() => this.xpert()?.copilotModel)
  readonly toolsets = computed(() => this.xpertAgent()?.toolsets)
  readonly title = computed(() => this.xpertAgent()?.title)
  readonly prompt = model<string>()
  readonly promptLength = computed(() => this.prompt()?.length)

  private get hostElement(): HTMLElement {
    return this.elementRef.nativeElement
  }

  readonly titleError = derivedAsync(() => {
    return this.xpertService
      .validateTitle(this.title())
      .pipe(map((items) => !!items.filter((item) => item.id !== this.xpertAgent().id).length))
  })

  readonly copilotModel = model<ICopilotModel>()

  readonly openedExecution = signal(false)

  constructor() {
    effect(() => {
      if (this.xpertAgent()) {
        this.prompt.set(this.xpertAgent().prompt)
        this.copilotModel.set(this.xpertAgent().copilotModel)
      }
    }, { allowSignalWrites: true })

    effect(() => {
      console.log(`copilotModel:`, this.copilotModel())
    })
    
  }

  protected emitSelectionChangeEvent(event: MouseEvent): void {
    this.hostElement.focus()
    event.preventDefault()
    // this.selectionService.setColumn(this.tableId, this.column.id);
  }

  onNameChange(event: string) {
    this.apiService.updateXpertAgent(this.key(), { name: event }, {emitEvent: false})
  }
  onTitleChange(event: string) {
    this.apiService.updateXpertAgent(this.key(), {
      title: event
    }, {emitEvent: false})
  }
  onDescChange(event: string) {
    this.apiService.updateXpertAgent(this.key(), { description: event }, {emitEvent: false})
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

  openExecution() {
    this.openedExecution.set(true)
  }
  closeExecution() {
    this.openedExecution.set(false)
  }
}
