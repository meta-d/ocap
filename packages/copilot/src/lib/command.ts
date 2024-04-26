import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools'
import { AgentExecutor } from 'langchain/agents'
import { BehaviorSubject, filter, map } from 'rxjs'
import { CopilotChatMessage, nonNullable } from './types/types'

/**
 * Copilot command, which can execute multiple actions.
 */
export interface CopilotCommand<Inputs extends any[] = any[]> {
  name: string
  description: string
  examples?: string[]
  systemPrompt?: () => string

  implementation?: (...args: Inputs) => Promise<void | string | CopilotChatMessage>

  /**
   * Action ids to execute.
   */
  actions?: string[]
  /**
   * Tools for agent (langchain)
   */
  tools?: Array<DynamicStructuredTool | DynamicTool>

  prompt?: any

  agentExecutor?: AgentExecutor
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
