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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
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
import { CopilotChatMessage, CopilotChatMessageRoleEnum, CopilotEngine } from '@metad/copilot'
import { NgmSearchComponent, NgmTableComponent } from '@metad/ocap-angular/common'
import { DensityDirective, getErrorMessage } from '@metad/ocap-angular/core'
import { isString, pick } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import {
  NgxPopperjsContentComponent,
  NgxPopperjsModule,
  NgxPopperjsPlacements,
  NgxPopperjsTriggers
} from 'ngx-popperjs'
import { BehaviorSubject, combineLatest, delay, firstValueFrom, map, scan, startWith, Subscription, tap } from 'rxjs'
import { CopilotEnableComponent } from '../enable/enable.component'
import { NgmCopilotEngineService, NgmCopilotService } from '../services/'
import { CopilotChatTokenComponent } from '../token/token.component'
import { UserAvatarComponent } from '../avatar/avatar.component'
import { IUser } from '../types'
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions'


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

    CopilotChatTokenComponent,
    CopilotEnableComponent,
    UserAvatarComponent,
  ],
  host: {
    class: 'ngm-copilot-chat'
  }
})
export class NgmCopilotChatComponent {
  NgxPopperjsPlacements = NgxPopperjsPlacements
  NgxPopperjsTriggers = NgxPopperjsTriggers
  CopilotChatMessageRoleEnum = CopilotChatMessageRoleEnum

  private popperjsContentComponent = inject(NgxPopperjsContentComponent, { optional: true })
  private translateService = inject(TranslateService)
  private _cdr = inject(ChangeDetectorRef)
  private copilotService = inject(NgmCopilotService)
  #copilotEngine?: CopilotEngine = inject(NgmCopilotEngineService, { optional: true })

  @Input() welcomeTitle: string
  @Input() welcomeSubTitle: string

  @Input() get copilotEngine(): CopilotEngine {
    return this.#copilotEngine
  }
  set copilotEngine(value) {
    this.#copilotEngine = value
  }

  // @Input() get systemPrompt(): string {
  //   return this.copilotEngine ? this.copilotEngine.systemPrompt : this._systemPrompt()
  // }
  set systemPrompt(value: string) {
    this._systemPrompt.set(value)
  }
  private readonly _systemPrompt = signal<string>(null)

  @Input() get conversations(): CopilotChatMessage[] {
    return this.copilotEngine ? this.copilotEngine.conversations : this._conversations()
  }
  set conversations(value) {
    if (value) {
      if (this.copilotEngine) {
        this.copilotEngine.conversations = value
      } else {
        this._conversations.set(value)
      }
    }
    
  }
  private readonly _conversations = signal<CopilotChatMessage[]>([])

  @Input() user: IUser

  @Output() copy = new EventEmitter()
  @Output() conversationsChange = new EventEmitter()

  @ViewChild('chatsContent') chatsContent: ElementRef<any>
  @ViewChild('copilotOptions') copilotOptions: NgxPopperjsContentComponent

  get enabled() {
    return this.copilotService.enabled
  }
  get hasKey() {
    return this.copilotService.hasKey
  }

  // get prompts() {
  //   return this.copilotEngine?.prompts
  // }

  get placeholder() {
    return this.copilotEngine?.placeholder
  }

  _mockConversations: CopilotChatMessage[] = [
    {
      role: CopilotChatMessageRoleEnum.User,
      content: '你好'
    },
    {
      role: CopilotChatMessageRoleEnum.Assistant,
      content: '你好！有什么我可以帮忙的吗？'
    },
    {
      role: CopilotChatMessageRoleEnum.User,
      content: '你是谁'
    },
    {
      role: CopilotChatMessageRoleEnum.Assistant,
      content:
        '我是ChatGPT，一个由OpenAI训练的自然语言处理模型。我可以回答各种问题并提供各种帮助。请问有什么我可以为您做的吗？'
    },
    {
      role: CopilotChatMessageRoleEnum.User,
      content: '假如你是我的 AI pair programmer'
    },
    {
      role: CopilotChatMessageRoleEnum.Assistant,
      content: `如果我是您的 AI pair programmer，那么我会与您合作编写代码，并提供技术支持和建议。我可以帮助您识别和纠正代码中的错误，优化代码性能，同时也可以为您提供实用的编程技巧和最佳实践。在与您的合作中，我将尽力提高我们的生产力和效率，并确保我们在团队合作中最大化我们的技能和资源。
      然而，需要注意的是，我只是一个机器人，并不能像人类程序员一样创造独特的解决方案或应对具有挑战性的技术问题。我的工作方式是基于预设的算法和模型，因此在与我合作时，您可能需要提供更多的背景信息和指导，以确保我们的工作结果达到您的期望。`
    }
  ]
  // examplesOpened = true
  // Copilot
  private openaiOptions = {
    model: 'gpt-3.5-turbo',
    useSystemPrompt: true
  } as ChatCompletionCreateParamsBase & { useSystemPrompt?: boolean }
  get aiOptions() {
    return this.copilotEngine?.aiOptions ?? this.openaiOptions
  }
  get useSystemPrompt() {
    return this.aiOptions.useSystemPrompt
  }
  set useSystemPrompt(value) {
    if (this.copilotEngine) {
      this.copilotEngine.aiOptions = { ...this.aiOptions, useSystemPrompt: value }
    } else {
      this.openaiOptions.useSystemPrompt = value
    }
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
   * 当前 Asking prompt
   */
  public promptControl = new FormControl<string>('')
  readonly prompt = toSignal(this.promptControl.valueChanges, {initialValue: ''})
  // get prompt() {
  //   return this.promptControl.value
  // }
  // set prompt(value) {
  //   this.promptControl.setValue(value)
  // }

  private activatedPrompt = ''

  readonly answering = signal(false)

  readonly historyQuestions = signal<string[]>([])
  private readonly historyIndex = signal(-1)

  askController: AbortController
  askSubscriber: Subscription

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

  readonly copilotEnabled = this.copilotService.enabled

  readonly commands = computed(() => this.copilotEngine?.commands().map((command) => ({
    ...command,
    prompt: `/${command.name} ${command.examples[0]}`
  })))

  readonly filteredCommands = computed(() => {
    const text = this.prompt()
    this.activatedPrompt = ''

    return (text ? this.commands()?.filter((item) => item.prompt.includes(text)) ?? [] : [])
  })

  private readonly lastConversation = computed(() => {
    // Get last conversation messages
    const lastMessages = []
    let lastUserMessage = null
    for (let i = this.conversations.length - 1; i >= 0; i--) {
      if (this.conversations[i].end) {
        break
      }
      if (this.conversations[i].role === CopilotChatMessageRoleEnum.User) {
        if (lastUserMessage) {
          lastUserMessage.content = this.conversations[i].content + '\n' + lastUserMessage.content
        } else {
          lastUserMessage = {
            role: CopilotChatMessageRoleEnum.User,
            content: this.conversations[i].content
          }
        }
      } else {
        if (lastUserMessage) {
          lastMessages.push(lastUserMessage)
          lastUserMessage = null
        }
        lastMessages.push(this.conversations[i])
      }
    }
    if (lastUserMessage) {
      lastMessages.push(lastUserMessage)
    }
    return lastMessages.reverse()
  })



  // Subscribers
  private _copilotSub = this.copilotService.copilot$.pipe(delay(1000), takeUntilDestroyed()).subscribe(() => {
    this._cdr.detectChanges()
  })

  constructor() {
    effect(
      () => {
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

    // Get last conversation messages
    const lastConversation = this.lastConversation()

    // Append user question message
    this.conversations = this.conversations ?? []
    this.conversations = [
      ...this.conversations,
      {
        role: CopilotChatMessageRoleEnum.User,
        content: prompt
      }
    ]

    // Assistant message
    const assistant: CopilotChatMessage = {
      role: CopilotChatMessageRoleEnum.Assistant,
      content: ''
    }

    // Answering
    this.answering.set(true)
    // 由其他引擎接手处理
    if (this.copilotEngine) {
      if (lastConversation.length > 0) {
        // 无论是否为新对话，都将最新的连续的提问消息内容汇总
        if (lastConversation[lastConversation.length - 1]?.role === CopilotChatMessageRoleEnum.User) {
          prompt = lastConversation[lastConversation.length - 1].content + '\n' + prompt
          lastConversation.splice(lastConversation.length - 1, 1)
        }

        // 如果是新会话，清空上一次的会话
        if (newConversation) {
          lastConversation.splice(0, lastConversation.length)
        }
      }

      const assistantIndex = this.conversations.length
      this.conversations = [...this.conversations, assistant]

      try {
        this.askSubscriber = this.copilotEngine.process({ prompt, messages: lastConversation }).subscribe({
          next: (result) => {
            result = result ?? []
            const conversations = [...this.conversations]
            if (isString(result)) {
              conversations[assistantIndex] = { ...conversations[assistantIndex] }
              conversations[assistantIndex].content = result
              // 为什么要 end 对话？
              // conversations[assistantIndex].end = true
            } else {
              conversations.splice(this.conversations.length, 0, ...result)
            }

            this.conversations = conversations
            this._cdr.detectChanges()
            this.scrollBottom()
          },
          error: (err) => {
            console.error(err)
            const conversations = [...this.conversations]
            conversations[assistantIndex] = { ...conversations[assistantIndex] }
            conversations[assistantIndex].content = null
            conversations[assistantIndex].error = getErrorMessage(err)
            this.answering.set(false)
            this.conversations = conversations
            this.conversationsChange.emit(this.conversations)
            this._cdr.detectChanges()
          },
          complete: () => {
            this.answering.set(false)
            // Not cleared
            if (this.conversations.length) {
              const conversations = [...this.conversations]
              if (!conversations[assistantIndex].content) {
                conversations.splice(assistantIndex, 1)
              }
              if (this.conversations[this.conversations.length - 1].role === CopilotChatMessageRoleEnum.Info) {
                conversations.splice(conversations.length - 1, 1)
              }
              this.conversations = conversations
              this.conversationsChange.emit(this.conversations)
              this._cdr.detectChanges()
            }
          }
        })
      } catch (err) {
        const conversations = [...this.conversations]
        conversations[assistantIndex] = { ...conversations[assistantIndex] }
        conversations[assistantIndex].content = null
        conversations[assistantIndex].error = getErrorMessage(err)
        this.answering.set(false)
        this.conversations = conversations
        this.conversationsChange.emit(this.conversations)
        this._cdr.detectChanges()
      }

      return
    }

    // 系统提示
    const messages: CopilotChatMessage[] =
      this.openaiOptions.useSystemPrompt && this.systemPrompt
        ? [
            {
              role: CopilotChatMessageRoleEnum.System,
              content: this.systemPrompt
            }
          ]
        : []
    // 合并连续的提问消息：如数据表和提问合并
    messages.push(
      ...this.conversations
        .filter((item) => !item.error && !!item.content)
        .reduceRight((prev, curr) => {
          if (!prev.length) {
            return [pick(curr, 'role', 'content')]
          }

          if (curr.role === prev[prev.length - 1].role) {
            prev[prev.length - 1].content = [curr.content, prev[prev.length - 1].content].join('\n')
          } else {
            prev.push(pick(curr, 'role', 'content'))
          }
          return prev
        }, [])
        .reverse()
    )

    this.conversations = [...this.conversations, assistant]

    this.scrollBottom()

    this.askSubscriber = this.copilotService
      .chatStream(messages)
      .pipe(
        scan((acc, value: any) => acc + (value?.choices?.[0]?.delta?.content ?? ''), ''),
        map((content) => content.trim())
      )
      .subscribe({
        next: (content) => {
          assistant.content = content
          this._cdr.detectChanges()

          this.scrollBottom()
        },
        error: (err) => {
          this.answering.set(false)
          assistant.content = null
          assistant.error = getErrorMessage(err)

          this.conversationsChange.emit(this.conversations)
          this._cdr.detectChanges()
        },
        complete: () => {
          this.answering.set(false)
          this.conversationsChange.emit(this.conversations)
          this._cdr.detectChanges()
        }
      })
  }

  stopGenerating() {
    this.askController?.abort()
    this.askSubscriber?.unsubscribe()
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
    setTimeout(() => {
      this.chatsContent.nativeElement.scrollTo({
        top: this.chatsContent.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })
    }, 300)
  }

  async send(text: string) {
    this.promptControl.setValue(text)
    // await this.askCopilot(this.prompt)
  }

  async run(event?: KeyboardEvent) {
    console.log(event)
    await navigator.clipboard.readText()
  }

  async clear() {
    this.conversations = []
    this.conversationsChange.emit(this.conversations)
  }

  closePopper() {
    this.popperjsContentComponent?.toggleVisibility(false)
  }

  async addMessage(message: CopilotChatMessage) {
    this.conversations ??= []
    this.conversations = [...this.conversations, message]
    this.scrollBottom()
    this._cdr.detectChanges()
  }

  deleteMessage(message: CopilotChatMessage) {
    const index = this.conversations.indexOf(message)
    if (index > -1) {
      const conversations = [...this.conversations]
      conversations.splice(index, 1)
      this.conversations = conversations
      this.conversationsChange.emit(this.conversations)
    }
  }

  async resubmitMessage(message: CopilotChatMessage, content: string) {
    const index = this.conversations.indexOf(message)
    if (index > -1) {
      const conversations = [...this.conversations]
      // 删除答案
      if (conversations[index + 1]?.role === CopilotChatMessageRoleEnum.Assistant) {
        conversations.splice(index + 1, 1)
      }
      // 删除提问
      conversations.splice(index, 1)

      this.conversations = conversations
      await this.askCopilotStream(content)
    }
  }

  onMessageFocus() {
    this._cdr.detectChanges()
  }

  isFoucs(target: HTMLDivElement | HTMLTextAreaElement) {
    return document.activeElement === target
  }

  triggerFun(event: KeyboardEvent, autocomplete: MatAutocomplete) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.askCopilotStream(this.prompt())
    }

    // Tab 键补全提示语
    if (event.key === 'Tab') {
      event.preventDefault()
      const activatedPrompt = this.activatedPrompt || this.filteredCommands()[0].examples[0]
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
    this.activatedPrompt = event.option?.value
  }

  dropCopilot(event) {
    if (this.copilotEngine) {
      this.copilotEngine.dropCopilot(event)
    }
  }
}
