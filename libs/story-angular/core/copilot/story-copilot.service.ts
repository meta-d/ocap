import { inject, Injectable } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AIOptions,
  CopilotChatMessage,
  CopilotEngine,
  freeChat,
  freePrompt,
  getCommand,
  getCommandPrompt,
  nonNullable,
  selectCommandExamples,
  selectCommands,
  SystemCommandClear,
  SystemCommandFree,
  SystemCommands
} from '@metad/copilot'
import { getErrorMessage, NgmCopilotService } from '@metad/core'
import { NgmCopilotEngineService } from '@metad/ocap-angular/copilot'
import { pick } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { catchError, combineLatest, filter, map, Observable, of, switchMap, throwError } from 'rxjs'
import { NxStoryService } from '../story.service'
import { I18N_STORY_NAMESPACE } from '../types'
import { StoryCopilotChatConversation, StoryCopilotCommandArea } from './types'

@Injectable()
export class StoryCopilotEngineService extends NgmCopilotEngineService {
  private copilotService = inject(NgmCopilotService)
  private storyService = inject(NxStoryService)
  private translateService = inject(TranslateService)
  private readonly logger = inject(NGXLogger)

  currentWidgetCopilot: CopilotEngine

  private readonly _commands = toSignal(
    selectCommands(StoryCopilotCommandArea).pipe(
      filter(nonNullable),
      map((commands) => Object.values(commands))
    ),
    { initialValue: [] }
  )
  
  private readonly _prompts = toSignal(
    selectCommandExamples(StoryCopilotCommandArea).pipe(
      map((CopilotCommands) => {
        return CopilotCommands.map(({ command, prompt }) => {
          return this.translateService
            .stream(`${I18N_STORY_NAMESPACE}.Copilot.Examples.${prompt}`, { Default: prompt })
            .pipe(map((prompt) => `/${command} ${prompt}`))
        })
      }),
      switchMap((i18nCommands) => combineLatest(i18nCommands)),
      map((commands) => [...commands, ...SystemCommands])
    ),
    { initialValue: [] }
  )

  aiOptions = {
    model: 'gpt-3.5-turbo',
    useSystemPrompt: true
  } as AIOptions
  // conversations: CopilotChatMessage[]

  get prompts() {
    return this._prompts()
  }

  private readonly dataSource = toSignal(
    this.storyService
      .select((state) => state.defaultDataSettings)
      .pipe(
        filter(nonNullable),
        switchMap(({ dataSource }) => dataSource)
      )
  )
  private readonly entityType = toSignal(
    this.storyService
      .select((state) => state.defaultDataSettings)
      .pipe(
        filter(nonNullable),
        switchMap(({ dataSource, entities }) =>
          this.storyService.selectEntityType({ dataSource, entitySet: entities[0] })
        )
      ),
    { initialValue: null }
  )

  process({ prompt: _prompt }, options?: { action?: string }) {
    this.logger.debug(`process ask: ${_prompt}`)

    const { command, prompt } = getCommandPrompt(_prompt)
    if (command) {
      if (command === SystemCommandClear) {
        return of([])
      } else if (!getCommand(StoryCopilotCommandArea, command)) {
        return throwError(() => new Error(`Command '${command}' not found`))
      }
    }

    const copilot = {
      dataSource: this.dataSource(),
      storyService: this.storyService,
      copilotService: this.copilotService,
      command,
      prompt,
      entityType: this.entityType(),
      options: pick(this.aiOptions, 'model', 'temperature'),
      logger: this.logger
    } as StoryCopilotChatConversation

    return (command
      ? of(copilot) : freePrompt(copilot, this._commands()).pipe(
        map((copilot) => {
          return {
            ...copilot,
            response: null,
            command: copilot.response.arguments.command
          } as StoryCopilotChatConversation
        })
      )
    ).pipe(
      switchMap((copilot) => {
        const { command } = copilot
        if (getCommand(StoryCopilotCommandArea, command)) {
          return getCommand(StoryCopilotCommandArea, command)
            .processor(copilot)
            .pipe(
              map((copilot: Partial<StoryCopilotChatConversation>) => {
                return `✅${this.getTranslation(`${I18N_STORY_NAMESPACE}.Copilot.InstructionExecutionComplete`, {
                  Default: 'Instruction execution complete'
                })}`
              }),
              catchError((err) => {
                console.error(err)
                return of(
                  `❌${this.getTranslation(`${I18N_STORY_NAMESPACE}.Copilot.InstructionExecutionError`, {
                    Default: 'Instruction execution error'
                  })}: ` + getErrorMessage(err)
                )
              })
            )
        } else if (command === SystemCommandFree) {
          return freeChat(copilot)
        }
      })
    )
  }

  getTranslation(key: string, params) {
    return this.translateService.instant(key, params)
  }
  
  clear() {}
}
