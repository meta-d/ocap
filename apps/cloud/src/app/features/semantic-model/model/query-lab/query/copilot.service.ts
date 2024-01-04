import { Injectable, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { CopilotChatMessageRoleEnum, CopilotService } from '@metad/copilot'
import { NgmCopilotEngineService } from '@metad/ocap-angular/copilot'
import { TranslateService } from '@ngx-translate/core'
import { cloneDeep, isEqual } from 'lodash-es'
import { nanoid } from 'nanoid'
import { Observable, map } from 'rxjs'
import { QueryService } from './query.service'

@Injectable()
export class QueryCopilotEngineService extends NgmCopilotEngineService {
  private readonly copilotService = inject(CopilotService)
  private readonly translateService = inject(TranslateService)
  readonly #queryService = inject(QueryService)

  get name() {
    return this._name()
  }
  private readonly _name = toSignal(
    this.translateService.stream('PAC.MODEL.QUERY.CopilotName', { Default: 'Query Lab' })
  )
  dbTablesPrompt = signal<string>(null)
  get systemPrompt() {
    return this._systemPrompt()
  }
  private readonly _systemPrompt = computed(
    () =>
      `假设你是数据库 SQL 编程专家, 如果 system 未提供 database tables information 请给出提示, ${this.dbTablesPrompt()}, 请给出问题对应的 sql 语句 (注意：表字段区分大小写，需要用双引号括起来)。 `
  )

  #conversationSub = this.#queryService
    .select((state) => state.query?.conversations ?? [])
    .subscribe((conversations) => {
      this.conversations$.set(cloneDeep(conversations))
    })
  constructor() {
    super()
    
    effect(() => {
      if (this.#queryService.initialized()) {
        if (!isEqual(this.#queryService.conversations(), this.conversations$())) {
          this.#queryService.setConversations(this.conversations$())
        }
      }
    }, {allowSignalWrites: true})
  }

  nl2SQL(sql: string): Observable<string> {
    return this.copilotService
      .chatCompletions([
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
      ])
      .pipe(map(({ choices }) => choices[0]?.message?.content))
  }

  explainSQL(sql: string): Observable<string> {
    return this.copilotService
      .chatCompletions([
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
      ])
      .pipe(map(({ choices }) => choices[0]?.message?.content))
  }

  optimizeSQL(sql: string): Observable<string> {
    return this.copilotService
      .chatCompletions([
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
      ])
      .pipe(map(({ choices }) => choices[0]?.message?.content))
  }

  ask(prompt: string): Observable<string> {
    return this.copilotService
      .chatCompletions([
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
      ])
      .pipe(map(({ choices }) => choices[0]?.message?.content))
  }
}
