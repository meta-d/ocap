import { ClipboardModule } from '@angular/cdk/clipboard'
import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  ViewChild
} from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocomplete, MatAutocompleteActivatedEvent, MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSliderModule } from '@angular/material/slider'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatInputModule } from '@angular/material/input'
import { RouterModule } from '@angular/router'
import { AIOptions, CopilotChatMessage, CopilotChatMessageRoleEnum, CopilotEngine, CopilotService } from '@metad/copilot'
import { NgmHighlightDirective, NgmSearchComponent, NgmTableComponent, NgmScrollBackComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import {
  NgxPopperjsContentComponent,
  NgxPopperjsModule,
  NgxPopperjsPlacements,
  NgxPopperjsTriggers
} from 'ngx-popperjs'
import { BehaviorSubject, combineLatest, delay, firstValueFrom, map, startWith, throttleTime } from 'rxjs'
import { NgmCopilotEnableComponent } from '../enable/enable.component'
import { NgmCopilotEngineService } from '../services/'
import { CopilotChatTokenComponent } from '../token/token.component'
import { UserAvatarComponent } from '../avatar/avatar.component'
import { IUser } from '../types'
import { nanoid } from 'nanoid'
import { injectCopilotCommand } from '../hooks'
import { PlaceholderMessages } from './types'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-copilot-chat',
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TextFieldModule,
    ClipboardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatListModule,
    MatSliderModule,
    TranslateModule,
    NgxPopperjsModule,
    MarkdownModule,
    
    DensityDirective,
    NgmSearchComponent,
    NgmTableComponent,
    NgmHighlightDirective,

    CopilotChatTokenComponent,
    NgmCopilotEnableComponent,
    UserAvatarComponent,
    NgmScrollBackComponent
  ],
  host: {
    class: 'ngm-copilot-chat'
  }
})
export class NgmCopilotChatComponent {
  NgxPopperjsPlacements = NgxPopperjsPlacements
  NgxPopperjsTriggers = NgxPopperjsTriggers
  CopilotChatMessageRoleEnum = CopilotChatMessageRoleEnum

  // private popperjsContentComponent = inject(NgxPopperjsContentComponent, { optional: true })
  private translateService = inject(TranslateService)
  private _cdr = inject(ChangeDetectorRef)
  private copilotService = inject(CopilotService)
  #copilotEngine?: CopilotEngine = inject(NgmCopilotEngineService, { optional: true })
  #customEngine?: CopilotEngine = null

  @Input() welcomeTitle: string
  @Input() welcomeSubTitle: string
  @Input() placeholder: string
  @Input() thinkingAvatar: string
  @Input() assistantAvatar: string

  @Input() get copilotEngine(): CopilotEngine {
    return this.#customEngine ?? this.#copilotEngine
  }
  set copilotEngine(value) {
    this.#customEngine = value
  }

  @Input() user: IUser

  @Output() copy = new EventEmitter()
  @Output() conversationsChange = new EventEmitter()
  @Output() enableCopilot = new EventEmitter()

  @ViewChild('chatsContent') chatsContent: ElementRef<HTMLDivElement>
  @ViewChild('copilotOptions') copilotOptions: NgxPopperjsContentComponent
  @ViewChild('scrollBack') scrollBack!: NgmScrollBackComponent

  get enabled() {
    return this.copilotService.enabled
  }
  get hasKey() {
    return this.copilotService.hasKey
  }

  get _placeholder() {
    return this.copilotEngine?.placeholder ?? this.placeholder
  }

  _mockConversations: CopilotChatMessage[] = PlaceholderMessages

  // Copilot
  private openaiOptions = {
    model: 'gpt-3.5-turbo',
    useSystemPrompt: true
  } as AIOptions
  get aiOptions() {
    return this.copilotEngine?.aiOptions ?? this.openaiOptions
  }

  get model() {
    return this.aiOptions.model
  }
  set model(value) {
    if (this.copilotEngine) {
      this.copilotEngine.aiOptions = { ...this.aiOptions, model: value }
    } else {
      this.openaiOptions.model = value
    }
  }

  selectedModel = [this.aiOptions.model]

  get temperature() {
    return this.aiOptions.temperature
  }
  set temperature(value) {
    if (this.copilotEngine) {
      this.copilotEngine.aiOptions = { ...this.aiOptions, temperature: value }
    } else {
      this.openaiOptions.temperature = value
    }
  }
  get n() {
    return this.aiOptions.n
  }
  set n(value) {
    if (this.copilotEngine) {
      this.copilotEngine.aiOptions = { ...this.aiOptions, n: value }
    } else {
      this.openaiOptions.n = value
    }
  }

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly showTokenizer$ = toSignal(this.copilotService.copilot$.pipe(map((copilot) => copilot?.showTokenizer)))
  readonly conversations = computed(() => this.copilotEngine.messages().filter((message) => 
    message.status === 'thinking' || message.content || message.error))

  /**
   * 当前 Asking prompt
   */
  public promptControl = new FormControl<string>('')
  readonly prompt = toSignal(this.promptControl.valueChanges, {initialValue: ''})

  #activatedPrompt = signal('')

  readonly answering = signal(false)

  readonly historyQuestions = signal<string[]>([])
  private readonly historyIndex = signal(-1)

  #abortController: AbortController

  // Available models
  private readonly _models$ = new BehaviorSubject<{ id: string; label: string }[]>([
    {
      id: 'gpt-3.5-turbo',
      label: 'gpt-3.5-turbo'
    },
    {
      id: 'gpt-4',
      label: 'gpt-4'
    },
    {
      id: 'gpt-4-32k',
      label: 'gpt-4-32k'
    }
  ])
  searchModel = new FormControl<string>('')
  public readonly models = toSignal(
    combineLatest([this._models$, this.searchModel.valueChanges.pipe(startWith(''))]).pipe(
      map(([_models, text]) => (text ? _models.filter((item) => item.label.includes(text)) : _models))
    ),
    { initialValue: [] }
  )

  get copilotEnabled() {
    return this.copilotService.enabled
  }

  readonly commands = computed(() => {
    if (this.copilotEngine?.commands) {
      const commands = []
      this.copilotEngine.commands().forEach((command) => {
        if (command.examples?.length) {
          command.examples.forEach((example) => {
            commands.push({
              ...command,
              prompt: `/${command.name} ${example}`,
              example
            })
          })
        } else {
          commands.push({
            ...command,
            prompt: `/${command.name} ${command.description}`
          })
        }
      })
      return commands
    }
    return []
  })

  readonly filteredCommands = computed(() => {
    const text = this.prompt()
    if (text) {
      return this.commands()?.filter((item) => item.prompt.includes(text)) ?? []
    }
    return []
  })

  public readonly suggestionsOpened$ = new BehaviorSubject(false)
  #suggestionsOpened = toSignal(this.suggestionsOpened$.pipe(delay(100)), { initialValue: false })

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #clearCommand = injectCopilotCommand({
    name: 'clear',
    description: this.translateService.instant('Ngm.Copilot.ClearConversation', {Default: 'Clear conversation'}),
    implementation: async () => {
      this.copilotEngine.clear()
    }
  })

  /**
  |--------------------------------------------------------------------------
  | Subscribers
  |--------------------------------------------------------------------------
  */
 /**
  * @deprecated use Signal
  */
  private _copilotSub = this.copilotService.copilot$.pipe(delay(1000), takeUntilDestroyed()).subscribe(() => {
    this._cdr.detectChanges()
  })
  private scrollSub = toObservable(this.conversations).pipe(throttleTime(300)).subscribe((conversations) => {
    if (conversations.length && !this.scrollBack.visible()) {
      this.scrollBottom()
    }
  })

  constructor() {
    effect(() => {
        this.answering() ? this.promptControl.disable() : this.promptControl.enable()
      },
      { allowSignalWrites: true }
    )
  }

  refreshModels() {
    this.copilotService.getModels().subscribe((res) => {
      this._models$.next(res.data.map((model) => ({ id: model.id, label: model.id })))
    })
  }

  changeSelectedModel(values) {
    this.model = values[0]
  }

  async askPredefinedPrompt(prompt: string) {
    this.stopGenerating()
    prompt = await firstValueFrom(this.translateService.get('PAC.Copilot.Prompts.' + prompt, { Default: prompt }))
    await this.askCopilotStream(prompt, true)
  }

  async askCopilotStream(prompt: string, newConversation?: boolean) {
    // Reset history index
    this.historyIndex.set(-1)
    // Add to history
    this.historyQuestions.set([prompt, ...this.historyQuestions()])
    // Clear prompt in input
    this.promptControl.setValue('')

    // Answering
    this.answering.set(true)
    // 由其他引擎接手处理
    if (this.copilotEngine) {
      try {
        this.#abortController = new AbortController()
        const message = await this.#copilotEngine.chat({ prompt, newConversation, messages: [] }, {
          abortController: this.#abortController
        })

        this.answering.set(false)
            
        if (typeof message === 'string') {
          this.copilotEngine.upsertMessage({
            id: nanoid(),
            role: 'info',
            content: message
          })
        } else if (message) {
          this.copilotEngine.upsertMessage(message)
        }

        this._cdr.detectChanges()
        this.scrollBottom()
      } catch (err) {
        this.answering.set(false)
        this.conversationsChange.emit(this.conversations)
        this._cdr.detectChanges()
      }
    }
  }

  stopGenerating() {
    this.#abortController?.abort()
    this.answering.set(false)
    this.conversationsChange.emit(this.conversations)

    this.scrollBottom()
  }

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }

  scrollBottom() {
    this.chatsContent.nativeElement.scrollTo({
      top: this.chatsContent.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }

  async send(text: string) {
    this.promptControl.setValue(text)
    // await this.askCopilot(this.prompt)
  }

  async run(event?: KeyboardEvent) {
    console.log(event)
    await navigator.clipboard.readText()
  }

  clear() {
    this.copilotEngine.clear()
    this.conversationsChange.emit(this.conversations)
    this.copilotOptions.hide()
  }

  onEnableCopilot() {
    this.enableCopilot.emit()
  }

  async addMessage(message: CopilotChatMessage) {
    this.copilotEngine.upsertMessage(message)
  }

  deleteMessage(message: CopilotChatMessage) {
    this.copilotEngine.deleteMessage(message)
    this.conversationsChange.emit(this.conversations)
  }

  async resubmitMessage(message: CopilotChatMessage, content: string) {
    this.copilotEngine.updateConversations((conversations) => {
      const index = conversations.indexOf(message)
      if (index > -1) {
        // 删除答案
        if (conversations[index + 1]?.role === CopilotChatMessageRoleEnum.Assistant) {
          conversations.splice(index + 1, 1)
        }
        // 删除提问
        conversations.splice(index, 1)
        return [...conversations]
      }
      return conversations
    })
    await this.askCopilotStream(content)
  }

  onMessageFocus() {
    this._cdr.detectChanges()
  }

  isFoucs(target: HTMLDivElement | HTMLTextAreaElement) {
    return document.activeElement === target
  }

  triggerFun(event: KeyboardEvent, autocomplete: MatAutocomplete) {
    if (event.shiftKey && event.key === 'Enter') {
      return
    }
    if (!this.#suggestionsOpened() && event.key === 'Enter') {
      this.askCopilotStream(this.prompt())
    }

    // Tab 键补全提示语
    if (event.key === 'Tab') {
      event.preventDefault()
      const activatedPrompt = this.#activatedPrompt() || this.filteredCommands()[0].examples[0]
      if (activatedPrompt) {
        this.promptControl.setValue(activatedPrompt)
      }
    }

    if (!autocomplete.isOpen && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault()

      const historyQuestions = this.historyQuestions()
      if (historyQuestions.length) {
        if (event.key === 'ArrowUp' && this.historyIndex() < historyQuestions.length - 1) {
          this.historyIndex.set(this.historyIndex() + 1)
        } else if (event.key === 'ArrowDown' && this.historyIndex() > -1) {
          this.historyIndex.set(this.historyIndex() - 1)
        } else {
          return
        }

        this.promptControl.setValue(historyQuestions[this.historyIndex()] ?? '')
      }
    }
  }

  onPromptActivated(event: MatAutocompleteActivatedEvent) {
    this.#activatedPrompt.set(event.option?.value)
  }

  dropCopilot(event) {
    if (this.copilotEngine) {
      this.copilotEngine.dropCopilot(event)
    }
  }
}


export function defaultSystemMessage(contextString: string): string {
  return `
Please act as an efficient, competent, conscientious, and industrious professional assistant.

Help the user achieve their goals, and you do so in a way that is as efficient as possible, without unnecessary fluff, but also without sacrificing professionalism.
Always be polite and respectful, and prefer brevity over verbosity.

The user has provided you with the following context:
\`\`\`
${contextString}
\`\`\`

They have also provided you with functions you can call to initiate actions on their behalf, or functions you can call to receive more information.

Please assist them as best you can.

You can ask them for clarifying questions if needed, but don't be annoying about it. If you can reasonably 'fill in the blanks' yourself, do so.

If you would like to call a function, call it without saying anything else.
`;
}
