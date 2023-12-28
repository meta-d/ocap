import { BehaviorSubject, Observable, filter, map } from 'rxjs'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import {
  CopilotChatConversation,
  CopilotChatMessageRoleEnum,
  CopilotDefaultOptions,
  getFunctionCall,
  nonNullable
} from './types/types'
import { Message, nanoid } from 'ai'

/**
 * Copilot command, which can execute multiple actions.
 */
export interface CopilotCommand<Inputs extends any[] = any[]> {
  name: string
  description: string
  examples?: string[]
  systemPrompt?: () => string
  /**
   * @deprecated use implementation
   * 
   * @param copilot 
   * @returns 
   */
  processor?: <T extends CopilotChatConversation = CopilotChatConversation>(copilot: T) => Observable<T>

  implementation?: (...args: Inputs) => Promise<void | string | Message>;

  /**
   * Action ids to execute.
   */
  actions?: string[]
}

export const CopilotCommands$ = new BehaviorSubject<Record<string, Record<string, CopilotCommand>>>({})

export function selectCommands(area: string) {
  return CopilotCommands$.pipe(map((commands) => commands[area]))
}

export function selectCommandExamples(area: string) {
  return selectCommands(area).pipe(
    filter(nonNullable),
    map((CopilotCommands) => {
      return Object.keys(CopilotCommands).reduce((acc, key) => {
        CopilotCommands[key].examples?.forEach((example) => {
          acc.push({
            command: CopilotCommands[key].name,
            prompt: example
          })
        })
        return acc
      }, [])
    })
  )
}

export function registerCommand(area: string, command: CopilotCommand) {
  CopilotCommands$.next({
    ...CopilotCommands$.value,
    [area]: {
      ...(CopilotCommands$.value[area] ?? {}),
      [command.name]: command
    }
  })
}

export function getCommand(area: string, name: string) {
  return CopilotCommands$.value[area]?.[name]
}

export const SystemCommandClear = 'clear'
export const SystemCommandFree = 'free'
export const SystemCommands = [`/${SystemCommandClear}`]

export function logResult<T extends CopilotChatConversation = CopilotChatConversation>(copilot: T): void {
  const { logger, prompt } = copilot
  logger?.debug(`The result of prompt '${prompt}':`, copilot.response)
}

export function freePrompt(copilot: CopilotChatConversation, commands: CopilotCommand[]) {
  const { copilotService, prompt } = copilot
  const systemPrompt = `请将提示语分配相应的 command。Commands are ${JSON.stringify([
    ...commands.map((item) => ({
      name: item.name,
      description: item.description
    })),
    {
      name: SystemCommandFree,
      description: 'Free prompt'
    }
  ])}`
  return copilotService
    .chatCompletions(
      [
        {
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.System,
          content: systemPrompt
        },
        {
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: prompt
        }
      ],
      {
        ...CopilotDefaultOptions,
        ...copilot.options,
        functions: [
          {
            name: 'assign-command',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(
              z.object({
                command: z.string().describe('Name of command')
              })
            )
          }
        ],
        function_call: { name: 'assign-command' }
      }
    )
    .pipe(
      map(({ choices }) => {
        try {
          copilot.response = getFunctionCall(choices[0].message)
        } catch (err) {
          copilot.error = err as Error
        }
        return copilot
      })
    )
}

export function freeChat(copilot: CopilotChatConversation) {
  const { copilotService, prompt } = copilot

  return copilotService
    .chatCompletions(
      [
        {
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: prompt
        }
      ],
      {
        ...CopilotDefaultOptions,
        ...copilot.options
      }
    )
    .pipe(
      map(({ choices }) => {
        return choices[0].message.content
      })
    )
}
