import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import {
  AIOptions,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatResponseChoice,
  CopilotEngine,
  DefaultModel
} from '@metad/copilot'
import { omit } from '@metad/ocap-core'
import { ComponentSubStore } from '@metad/store'
import { TranslateService } from '@ngx-translate/core'
import { nonBlank } from '@metad/core'
import { Observable, distinctUntilChanged, filter, map, scan, startWith, tap } from 'rxjs'
import { QueryLabService, QueryLabState } from '../query-lab.service'
import { ModelQueryState } from '../../types'
import { NgmCopilotService } from '@metad/ocap-angular/copilot'
import { nanoid } from 'nanoid'


@Injectable()
export class QueryCopilotEngineService
  extends ComponentSubStore<ModelQueryState, QueryLabState>
  implements OnDestroy, CopilotEngine
{
  private readonly route = inject(ActivatedRoute)
  private readonly copilotService = inject(NgmCopilotService)
  private readonly translateService = inject(TranslateService)

  get name() {
    return this._name()
  }
  private readonly _name = toSignal(this.translateService.stream('PAC.MODEL.QUERY.CopilotName', { Default: 'Query Lab' }))

  get placeholder() {
    return this._placeholder()
  }
  private readonly _placeholder = toSignal(
    this.translateService.stream('PAC.MODEL.QUERY.CopilotPlaceholder', {
      Default: `Ask a question or request, type CTRL + Enter to send`
    })
  )

  prompts: string[]
  get conversations() {
    return this._conversations()
  }
  set conversations(value) {
    this.setConversations(value)
  }
  private readonly _conversations = toSignal(this.select((state) => state?.query?.conversations ?? []))

  get aiOptions() {
    return this._aiOptions()
  }
  set aiOptions(value) {
    this.setAIOptions(value)
  }
  private readonly _aiOptions = toSignal<AIOptions, AIOptions>(
    this.select(
      (state) =>
        state?.query?.aiOptions ??
        ({
          model: DefaultModel,
          useSystemPrompt: true
        } as AIOptions)
    ),
    {
      initialValue: {
        model: DefaultModel,
        useSystemPrompt: true
      } as AIOptions
    }
  )

  dbTablesPrompt = signal<string>(null)
  get systemPrompt() {
    return this._systemPrompt()
  }
  private readonly _systemPrompt = computed(() => `假设你是数据库 SQL 编程专家, 如果 system 未提供 database tables information 请给出提示, ${this.dbTablesPrompt()}, 请给出问题对应的 sql 语句 (注意：表字段区分大小写，需要用双引号括起来)。 `)

  private readonly lastConversation = computed(() => {
    const messages = []
    for (let i = this._conversations().length - 1; i >= 0; i--) {
      if (this._conversations()[i].end) {
        break
      }

      messages.push(this._conversations()[i])
    }

    return messages.reverse()
  })

  private queryKeySub = this.route.paramMap
    .pipe(
      startWith(this.route.snapshot.paramMap),
      map((paramMap) => paramMap.get('id')),
      filter(nonBlank),
      map(decodeURIComponent),
      distinctUntilChanged(),
      takeUntilDestroyed()
    )
    .subscribe((key) => this.init(key))

  constructor(public queryLabService: QueryLabService) {
    super({} as ModelQueryState)
  }

  public init(key: string) {
    this.connect(this.queryLabService, { parent: ['queries', key] })
  }

  setConversations = this.updater((state, conversations: CopilotChatMessage[]) => {
    state.query.conversations = conversations
  })
  setAIOptions = this.updater((state, options: AIOptions) => {
    state.query.aiOptions = options
  })

  process({prompt, messages}, options?: { action?: string }): Observable<string | CopilotChatMessage[]> {
    return this.copilotService
      .chatStream(
        [
          ...(
            this.aiOptions.useSystemPrompt && this.systemPrompt
            ? [
                {
                  role: CopilotChatMessageRoleEnum.System,
                  content: this.systemPrompt
                }
              ]
            : []
          ),
          ...messages,
          {
            role: CopilotChatMessageRoleEnum.User,
            content: prompt
          }
        ],
        omit(this.aiOptions, 'useSystemPrompt')
      )
      .pipe(
        scan((acc, value: any) => acc + (value?.choices?.[0]?.delta?.content ?? ''), ''),
        map((content) => content.trim()),
      )
  }
  
  preprocess(prompt: string, options?: any) {
    throw new Error('Method not implemented.')
  }
  postprocess(prompt: string, choices: CopilotChatResponseChoice[]): Observable<string | CopilotChatMessage[]> {
    throw new Error('Method not implemented.')
  }

  nl2SQL(sql: string): Observable<string> {
    return this.copilotService.chatCompletions([
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.System,
        content: `假如你是一个数据库管理员，已知数据库信息有：\n${this.dbTablesPrompt()}`
      },
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: `请根据给定的表信息和要求给出相应的SQL语句(仅输出 sql 语句)， 要求：\n${sql}，答案：`
      }
    ]).pipe(
      map(({choices}) => choices[0]?.message?.content)
    )
  }

  explainSQL(sql: string): Observable<string> {
    return this.copilotService.chatCompletions([
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.System,
        content: `假如你是一个数据库管理员，已知数据库信息有：\n${this.dbTablesPrompt()}`
      },
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: `请根据给定的表信息解释一下这个SQL语句：\n${sql}`
      }
    ]).pipe(
      map(({choices}) => choices[0]?.message?.content)
    )
  }

  optimizeSQL(sql: string): Observable<string> {
    return this.copilotService.chatCompletions([
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.System,
        content: `假如你是一个数据库管理员，已知数据库信息有：\n${this.dbTablesPrompt()}`
      },
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: `请根据给定的表信息优化一下这个SQL语句(仅输出 sql 语句)：\n${sql}`
      }
    ]).pipe(
      map(({choices}) => choices[0]?.message?.content)
    )
  }

  ask(prompt: string): Observable<string> {
    return this.copilotService.chatCompletions([
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.System,
        content: `假如你是一个数据库管理员，已知数据库信息有：\n${this.dbTablesPrompt()}`
      },
      {
        id: nanoid(),
        role: CopilotChatMessageRoleEnum.User,
        content: `${prompt}`
      }
    ]).pipe(
      map(({choices}) => choices[0]?.message?.content)
    )
  }

  ngOnDestroy(): void {
    super.onDestroy()
  }
}
