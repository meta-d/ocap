import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard'
import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  computed,
  effect,
  inject,
  model,
  signal,
  viewChild
} from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatAutocomplete,
  MatAutocompleteActivatedEvent,
  MatAutocompleteModule,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSliderModule } from '@angular/material/slider'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import {
  AIOptions,
  AI_PROVIDERS,
  AiModelType,
  CopilotChatConversation,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotEngine,
  CopilotService
} from '@metad/copilot'
import {
  NgmHighlightDirective,
  NgmScrollBackComponent,
  NgmSearchComponent,
  NgmTableComponent
} from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { nanoid } from 'nanoid'
import { MarkdownModule } from 'ngx-markdown'
import {
  NgxPopperjsContentComponent,
  NgxPopperjsModule,
  NgxPopperjsPlacements,
  NgxPopperjsTriggers
} from 'ngx-popperjs'
import { BehaviorSubject, delay, startWith, throttleTime } from 'rxjs'
import { UserAvatarComponent } from '../avatar/avatar.component'
import { NgmCopilotEnableComponent } from '../enable/enable.component'
import { injectCopilotCommand } from '../hooks'
import { NgmCopilotEngineService } from '../services/'
import { CopilotChatTokenComponent } from '../token/token.component'
import { IUser, NgmCopilotChatMessage } from '../types'
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

  private translateService = inject(TranslateService)
  private _cdr = inject(ChangeDetectorRef)
  private copilotService = inject(CopilotService)
  readonly #copilotEngine?: CopilotEngine = inject(NgmCopilotEngineService, { optional: true })

  readonly copilotEngine$ = signal<CopilotEngine>(this.#copilotEngine)

  readonly #clipboard: Clipboard = inject(Clipboard)

  @Input() welcomeTitle: string
  @Input() welcomeSubTitle: string
  @Input() placeholder: string
  @Input() thinkingAvatar: string
  @Input() assistantAvatar: string

  @Input() get copilotEngine(): CopilotEngine {
    return this.copilotEngine$()
  }
  set copilotEngine(value) {
    this.copilotEngine$.set(value ?? this.#copilotEngine)
  }

  @Input() user: IUser

  @Output() copy = new EventEmitter()
  @Output() conversationsChange = new EventEmitter()
  @Output() enableCopilot = new EventEmitter()

  @ViewChild('chatsContent') chatsContent: ElementRef<HTMLDivElement>
  @ViewChild('copilotOptions') copilotOptions: NgxPopperjsContentComponent
  @ViewChild('scrollBack') scrollBack!: NgmScrollBackComponent

  readonly autocompleteTrigger = viewChild('userInput', { read: MatAutocompleteTrigger })

  get _placeholder() {
    return this.copilotEngine?.placeholder ?? this.placeholder
  }

  readonly _mockConversations: Array<CopilotChatConversation<NgmCopilotChatMessage>> = [
    {
      id: '',
      messages: PlaceholderMessages,
      type: 'free'
    }
  ]

  // Copilot
  private openaiOptions = {
    model: null,
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

  readonly selectedModel = model([this.aiOptions.model])

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
  readonly copilot = toSignal(this.copilotService.copilot$)
  readonly copilotEnabled = toSignal(this.copilotService.enabled$)
  readonly showTokenizer$ = computed(() => this.copilot()?.showTokenizer)
  readonly #defaultModel = computed(() => this.copilot()?.defaultModel)
  readonly #predefinedModels = computed(() => AI_PROVIDERS[this.copilot()?.provider]?.models)
  readonly canListModels = computed(() => !!AI_PROVIDERS[this.copilot()?.provider]?.modelsUrl)
  readonly latestModels = signal<AiModelType[]>([])
  readonly conversations = computed<Array<CopilotChatConversation<NgmCopilotChatMessage>>>(() =>
    this.copilotEngine?.conversations()
  )
  readonly isTools = toSignal(this.copilotService.isTools$)

  /**
   * 当前 Asking prompt
   */
  public promptControl = new FormControl<string>('')
  readonly prompt = toSignal(this.promptControl.valueChanges, { initialValue: '' })

  #activatedPrompt = signal('')

  readonly command = computed(() => {
    const prompt = this.prompt()
    if (prompt && prompt.startsWith('/')) {
      return prompt.split(' ')[0]
    }
    return ''
  })

  readonly commandTitle = computed(() => {
    const commands = this.commands()
    const command = this.command()?.slice(1)
    return commands.find((item) => item.name === command)?.description ?? `Can't find command: ${command}`
  })

  readonly answering = signal(false)

  readonly historyQuestions = signal<string[]>([])
  private readonly historyIndex = signal(-1)

  #abortController: AbortController

  // Available models
  searchModel = new FormControl<string>('')
  readonly searchText = toSignal(this.searchModel.valueChanges.pipe(startWith('')), { initialValue: '' })
  readonly triggerCharacter = signal('')
  readonly models = computed(() => {
    const text = this.searchText()?.toLowerCase()
    const models = this.latestModels()?.length ? this.latestModels() : this.#predefinedModels()
    return text ? models?.filter((item) => item.name.toLowerCase().includes(text)) : models
  })

  readonly commands = computed(() => {
    if (this.copilotEngine?.commands && this.isTools()) {
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
    if (this.triggerCharacter() === '@') {
      return this.commands()
    }
    if (text) {
      return this.commands()?.filter((item) => item.prompt.includes(text)) ?? []
    }

    return []
  })

  readonly suggestionsOpened$ = new BehaviorSubject(false)
  readonly #suggestionsOpened = toSignal(this.suggestionsOpened$.pipe(delay(100)), { initialValue: false })
  readonly messageCopied = signal<string[]>([])

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  #clearCommand = injectCopilotCommand({
    name: 'clear',
    description: this.translateService.instant('Ngm.Copilot.ClearConversation', { Default: 'Clear conversation' }),
    implementation: async () => {
      this.copilotEngine.clear()
    }
  })

  /**
  |--------------------------------------------------------------------------
  | Subscribers
  |--------------------------------------------------------------------------
  */
  private scrollSub = toObservable(this.conversations)
    .pipe(throttleTime(300))
    .subscribe((conversations) => {
      if (conversations.length && !this.scrollBack.visible()) {
        this.scrollBottom()
      }
    })

  constructor() {
    effect(
      () => {
        this.answering() ? this.promptControl.disable() : this.promptControl.enable()
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      this.selectedModel.set([this.#defaultModel()])
      this.model = this.#defaultModel()
    }, { allowSignalWrites: true })
  }

  refreshModels() {
    this.copilotService.getModels().subscribe((res) => {
      this.latestModels.set(res.data.map((model) => ({ id: model.id, name: model.id })))
    })
  }

  changeSelectedModel(values) {
    this.model = values[0]
  }

  async askCopilotStream(
    prompt: string,
    options: { command?: string; newConversation?: boolean; assistantMessageId?: string } = {}
  ) {
    const { command, newConversation, assistantMessageId } = options ?? {}
    // Reset history index
    this.historyIndex.set(-1)
    // Add to history
    if (prompt) {
      this.historyQuestions.set([prompt, ...this.historyQuestions()])
    }
    // Clear prompt in input
    this.promptControl.setValue('')

    // Answering
    this.answering.set(true)
    // 由其他引擎接手处理
    if (this.copilotEngine) {
      try {
        this.#abortController = new AbortController()
        const message = await this.copilotEngine$().chat(prompt, {
          command,
          newConversation,
          abortController: this.#abortController,
          assistantMessageId
        })

        if (typeof message === 'string') {
          this.copilotEngine.upsertMessage({
            id: nanoid(),
            role: 'info',
            content: message
          })
        } else if (message) {
          this.copilotEngine.upsertMessage(message)
        }

        this.scrollBottom()
      } catch (err) {
        this.conversationsChange.emit(this.conversations)
      } finally {
        this.answering.set(false)
      }
    }
  }

  stopGenerating() {
    this.#abortController?.abort()
    this.answering.set(false)
    this.conversationsChange.emit(this.conversations)

    this.scrollBottom()
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

  async run() {
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

  async resubmitMessage(id: string, message: CopilotChatMessage, content: string) {
    this.copilotEngine.updateConversation(id, (conversation) => {
      const messages = conversation.messages
      const index = messages.findIndex((item) => item.id === message.id)
      if (index > -1) {
        // 删除答案
        if (messages[index + 1]?.role === CopilotChatMessageRoleEnum.Assistant) {
          messages.splice(index + 1, 1)
        }
        // 删除提问
        messages.splice(index, 1)
        if (!messages.filter((message) => message.role === CopilotChatMessageRoleEnum.User).length) {
          return null
        }
        return {
          ...conversation,
          messages: [...messages]
        }
      }
      return conversation
    })
    await this.askCopilotStream(content, { command: message.command })
  }

  onMessageFocus() {
    this._cdr.detectChanges()
  }

  /**
   * @deprecated regenerate method should in copilot engine service
   */
  async regenerate(message: CopilotChatMessage) {
    this.copilotEngine.updateLastConversation((conversation) => {
      const messages = conversation.messages
      const index = messages.findIndex((item) => item.id === message.id)
      messages.splice(index)
      return { ...conversation, messages: [...messages] }
    })
    await this.askCopilotStream(null, { assistantMessageId: message.id })
  }

  isFoucs(target: HTMLDivElement | HTMLTextAreaElement) {
    return document.activeElement === target
  }

  triggerFun(event: KeyboardEvent, autocomplete: MatAutocomplete) {
    if ((event.isComposing || event.shiftKey) && event.key === 'Enter') {
      return
    }
    if (!this.#suggestionsOpened() && event.key === 'Enter') {
      this.askCopilotStream(this.prompt())
    }

    this.triggerCharacter.set('')

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

    if (event.key === '@') {
      this.triggerCharacter.set('@')
      this.autocompleteTrigger().openPanel()
    }
  }

  onPromptActivated(event: MatAutocompleteActivatedEvent) {
    this.#activatedPrompt.set(event.option?.value)
  }

  copyMessage(message: CopilotChatMessage) {
    this.copy.emit(message.content)
    this.#clipboard.copy(message.content)
    this.messageCopied.update((ids) => [...ids, message.id])
    setTimeout(() => {
      this.messageCopied.update((ids) => ids.filter((id) => id !== message.id))
    }, 3000)
  }

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }

  dropCopilot(event: CdkDragDrop<any[], any[], any>) {
    if (this.copilotEngine) {
      this.copilotEngine.dropCopilot(event)
    }
  }
}
