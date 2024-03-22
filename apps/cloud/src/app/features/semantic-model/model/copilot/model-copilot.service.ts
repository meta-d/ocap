import { inject, Injectable } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AIOptions,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatResponseChoice,
  DefaultModel,
  getCommandPrompt,
  selectCommandExamples,
  SystemCommandClear,
  SystemCommands
} from '@metad/copilot'
import { NgmCopilotEngineService } from '@metad/ocap-angular/copilot'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { combineLatest, from, map, of, switchMap, throwError } from 'rxjs'
import { ModelEntityService } from '../entity/entity.service'
import { ModelCopilotCommandArea } from './types'
import { nanoid } from 'ai'

export const I18N_MODEL_NAMESPACE = 'PAC.MODEL'

/**
 * @deprecated use NgmCopilotEngineService
 */
@Injectable()
export class ModelCopilotEngineService extends NgmCopilotEngineService {
  // private readonly translateService = inject(TranslateService)
  private readonly logger = inject(NGXLogger)

  // public entityService: ModelEntityService

  // private readonly _name = toSignal(
  //   this.translateService.stream('PAC.MODEL.MODEL.CopilotName', { Default: 'Modeling' })
  // )

  // aiOptions = {
  //   model: DefaultModel,
  //   useSystemPrompt: true
  // } as AIOptions

  // private readonly _prompts = toSignal(
  //   selectCommandExamples(ModelCopilotCommandArea).pipe(
  //     map((CopilotCommands) => {
  //       return CopilotCommands.map(({ command, prompt }) => {
  //         return this.translateService
  //           .stream(`${I18N_MODEL_NAMESPACE}.Copilot.Examples.${prompt}`, { Default: prompt })
  //           .pipe(map((prompt) => `/${command} ${prompt}`))
  //       })
  //     }),
  //     switchMap((i18nCommands) => combineLatest(i18nCommands)),
  //     map((commands) => [...commands, ...SystemCommands])
  //   ),
  //   { initialValue: [] }
  // )

  // conversations: CopilotChatMessage[] = []

  // businessAreas = [
  //   {
  //     businessArea: 'Prompt',
  //     action: 'free_prompt',
  //     prompts: {
  //       zhHans: '自由提问'
  //     },
  //     language: 'text',
  //     format: 'text'
  //   },
  //   {
  //     businessArea: 'Dimension',
  //     action: 'create_dimension',
  //     prompts: {
  //       zhHans: '创建维度'
  //     },
  //     language: 'dimension',
  //     format: 'json'
  //   },
  //   {
  //     businessArea: 'Dimension',
  //     action: 'modify_dimension',
  //     prompts: {
  //       zhHans: '修改维度'
  //     }
  //   },
  //   {
  //     businessArea: 'Cube',
  //     action: 'create_cube',
  //     prompts: {
  //       zhHans: '创建数据集'
  //     },
  //     language: 'cube',
  //     format: 'json'
  //   },
  //   {
  //     businessArea: 'Cube',
  //     action: 'modify_cube',
  //     prompts: {
  //       zhHans: '修改数据集'
  //     },
  //     language: 'cube',
  //     format: 'json'
  //   },
  //   {
  //     businessArea: 'Cube',
  //     action: 'query_cube',
  //     prompts: {
  //       zhHans: '查询数据集'
  //     },
  //     language: 'mdx'
  //   }
  // ]

  // process({ prompt: _prompt, messages }) {
  //   this.logger.debug(`process ask: ${_prompt}`)

  //   const { command, prompt } = getCommandPrompt(_prompt)
  //   if (command) {
  //     if (command === SystemCommandClear) {
  //       this.conversations = []
  //       return of([])
  //     } else if (!this.getCommand(command)) {
  //       return throwError(() => new Error(`Command '${command}' not found`))
  //     }
  //   }

  //   const _command = this.getCommand(command)

  //   return from(
  //     super.triggerRequest(
  //       [
  //         {
  //           id: nanoid(),
  //           role: CopilotChatMessageRoleEnum.System,
  //           content: _command.systemPrompt()
  //         },
  //         {
  //           id: nanoid(),
  //           role: CopilotChatMessageRoleEnum.User,
  //           content: prompt
  //         }
  //       ],
  //       {}
  //     )
  //   ).pipe(map((chatRequest) => chatRequest?.messages))
  // }

  // process({ prompt: _prompt, messages }) {
  //   this.logger.debug(`process ask: ${_prompt}`)

  //   const { command, prompt } = getCommandPrompt(_prompt)
  //   if (command) {
  //     if (command === SystemCommandClear) {
  //       this.conversations = []
  //       return of([])
  //     } else if (!this.getCommand(command)) {
  //       return throwError(() => new Error(`Command '${command}' not found`))
  //     }
  //   }

  //   const copilot = {
  //     modelService: this.modelService,
  //     entityService: this.entityService,
  //     copilotService: this.copilotService,
  //     command,
  //     prompt,
  //     options: pick(this.aiOptions, 'model', 'temperature'),
  //     logger: this.logger,
  //     // sharedDimensionsPrompt: this.sharedDimensionsPrompt()
  //   } as ModelCopilotChatConversation

  //   return (
  //     command
  //       ? of(copilot)
  //       : freePrompt(copilot, this._commands()).pipe(
  //           tap(logResult),
  //           map((copilot) => {
  //             return {
  //               ...copilot,
  //               response: null,
  //               command: copilot.response.arguments.command
  //             } as ModelCopilotChatConversation
  //           })
  //         )
  //   ).pipe(
  //     switchMap((copilot) => {
  //       const { command } = copilot
  //       if (this.getCommand(command)) {
  //         return this.getCommand(command)
  //           .processor(copilot)
  //           .pipe(
  //             map((copilot: Partial<ModelCopilotChatConversation>) => {
  //               return `✅${this.getTranslation(`${I18N_MODEL_NAMESPACE}.Copilot.InstructionExecutionComplete`, {
  //                 Default: 'Instruction execution complete'
  //               })}`
  //             }),
  //             catchError((err) => {
  //               console.error(err)
  //               return of(
  //                 `❌${this.getTranslation(`${I18N_MODEL_NAMESPACE}.Copilot.InstructionExecutionError`, {
  //                   Default: 'Instruction execution error'
  //                 })}: ` + getErrorMessage(err)
  //               )
  //             })
  //           )
  //       } else if (command === SystemCommandFree) {
  //         return freeChat(copilot)
  //       }
  //     })
  //   )
  // }

  // postprocess(prompt: string, choices: CopilotChatResponseChoice[]) {
  //   return of(prompt)
  // }

  // getTranslation(key: string, params) {
  //   return this.translateService.instant(key, params)
  // }
}
