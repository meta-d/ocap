import { computed, inject, Injectable } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AIOptions,
  CopilotChatMessage,
  CopilotChatResponseChoice,
  CopilotEngine,
  DefaultModel,
  freeChat,
  freePrompt,
  getCommand,
  getCommandPrompt,
  logResult,
  nonNullable,
  selectCommandExamples,
  selectCommands,
  SystemCommands
} from '@metad/copilot'
import { NgmCopilotService } from '@metad/core'
import { pick } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { catchError, combineLatest, filter, map, of, switchMap, tap, throwError } from 'rxjs'
import { getErrorMessage } from '../../../../@core'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'
import { ModelCopilotChatConversation, ModelCopilotCommandArea } from './types'

export const I18N_MODEL_NAMESPACE = 'PAC.MODEL'

@Injectable()
export class ModelCopilotEngineService implements CopilotEngine {
  private copilotService = inject(NgmCopilotService)
  private readonly translateService = inject(TranslateService)
  private readonly modelService = inject(SemanticModelService)
  private readonly logger = inject(NGXLogger)

  public entityService: ModelEntityService

  private readonly dimensions = toSignal(this.modelService.dimensions$)
  private readonly sharedDimensionsPrompt = computed(() =>
    JSON.stringify(
      this.dimensions().map((dimension) => ({
        name: dimension.name,
        caption: dimension.caption,
        table: dimension.hierarchies[0].tables[0]?.name,
        primaryKey: dimension.hierarchies[0].primaryKey
      }))
    )
  )

  // private readonly currentCube = toSignal(this.modelService.currentCube$)
  // private readonly currentDimension = toSignal(this.modelService.currentDimension$)

  get name() {
    return this._name()
  }
  private readonly _name = toSignal(
    this.translateService.stream('PAC.MODEL.MODEL.CopilotName', { Default: 'Modeling' })
  )

  aiOptions = {
    model: DefaultModel,
    useSystemPrompt: true
  } as AIOptions

  get prompts() {
    return this._prompts()
  }

  private readonly _prompts = toSignal(
    selectCommandExamples(ModelCopilotCommandArea).pipe(
      map((CopilotCommands) => {
        return CopilotCommands.map(({ command, prompt }) => {
          return this.translateService
            .stream(`${I18N_MODEL_NAMESPACE}.Copilot.Examples.${prompt}`, { Default: prompt })
            .pipe(map((prompt) => `/${command} ${prompt}`))
        })
      }),
      switchMap((i18nCommands) => combineLatest(i18nCommands)),
      map((commands) => [...commands, ...SystemCommands])
    ),
    { initialValue: [] }
  )

  conversations: CopilotChatMessage[] = []

  businessAreas = [
    {
      businessArea: 'Prompt',
      action: 'free_prompt',
      prompts: {
        zhHans: '自由提问'
      },
      language: 'text',
      format: 'text'
    },
    {
      businessArea: 'Dimension',
      action: 'create_dimension',
      prompts: {
        zhHans: '创建维度'
      },
      language: 'dimension',
      format: 'json'
    },
    {
      businessArea: 'Dimension',
      action: 'modify_dimension',
      prompts: {
        zhHans: '修改维度'
      }
    },
    {
      businessArea: 'Cube',
      action: 'create_cube',
      prompts: {
        zhHans: '创建数据集'
      },
      language: 'cube',
      format: 'json'
    },
    {
      businessArea: 'Cube',
      action: 'modify_cube',
      prompts: {
        zhHans: '修改数据集'
      },
      language: 'cube',
      format: 'json'
    },
    {
      businessArea: 'Cube',
      action: 'query_cube',
      prompts: {
        zhHans: '查询数据集'
      },
      language: 'mdx'
    }
  ]

  get systemPrompt() {
    return `预设条件：${JSON.stringify({
      BusinessAreas: this.businessAreas
    })}
根据问题给出涉及到的多个 action 相应 language in format 的答案，value 值使用 object，不用注释，不用额外属性，例如
问题：根据表 product (id string, name string, type string) 信息创建产品维度
答案：
{
  "action": "create_dimension",
  "value": {
    "name": "product",
    "caption": "产品",
    "hierarchies": [
      {
        "name": "",
        "caption": "产品",
        "tables": [
          {
            "name": "product"
          }
        ],
        "levels": [
          {
            "name": "type",
            "column": "type",
            "caption": "类型"
          },
          {
            "name": "name",
            "column": "name",
            "caption": "名称"
          }
        ]
      }
    ]
  }
}
`
  }

  private readonly commands = toSignal(
    selectCommands(ModelCopilotCommandArea).pipe(
      filter(nonNullable),
      map((commands) => Object.values(commands))
    ),
    { initialValue: [] }
  )

  process({ prompt: _prompt, messages }) {
    this.logger.debug(`process ask: ${_prompt}`)

    const { command, prompt } = getCommandPrompt(_prompt)
    if (command) {
      if (command === 'clear') {
        this.conversations = []
        return of([])
      } else if (!getCommand(ModelCopilotCommandArea, command)) {
        return throwError(() => new Error(`Command '${command}' not found`))
      }
    }

    const copilot = {
      modelService: this.modelService,
      entityService: this.entityService,
      copilotService: this.copilotService,
      command,
      prompt,
      options: pick(this.aiOptions, 'model', 'temperature'),
      logger: this.logger,
      sharedDimensionsPrompt: this.sharedDimensionsPrompt()
    } as ModelCopilotChatConversation

    return (
      command
        ? of(copilot)
        : freePrompt(copilot, this.commands()).pipe(
            tap(logResult),
            map((copilot) => {
              return {
                ...copilot,
                response: null,
                command: copilot.response.arguments.command
              } as ModelCopilotChatConversation
            })
          )
    ).pipe(
      switchMap((copilot) => {
        const { command } = copilot
        if (getCommand(ModelCopilotCommandArea, command)) {
          return getCommand(ModelCopilotCommandArea, command)
            .processor(copilot)
            .pipe(
              map((copilot: Partial<ModelCopilotChatConversation>) => {
                return `✅${this.getTranslation(`${I18N_MODEL_NAMESPACE}.Copilot.InstructionExecutionComplete`, {
                  Default: 'Instruction execution complete'
                })}`
              }),
              catchError((err) => {
                console.error(err)
                return of(
                  `❌${this.getTranslation(`${I18N_MODEL_NAMESPACE}.Copilot.InstructionExecutionError`, {
                    Default: 'Instruction execution error'
                  })}: ` + getErrorMessage(err)
                )
              })
            )
        } else if (command === 'free') {
          return freeChat(copilot)
        }
      })
    )
  }

  postprocess(prompt: string, choices: CopilotChatResponseChoice[]) {
    return of(prompt)
  }

  getTranslation(key: string, params) {
    return this.translateService.instant(key, params)
  }
}
