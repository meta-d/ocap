import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools'
import { AgentExecutor } from 'langchain/agents'
import { BehaviorSubject, filter, map } from 'rxjs'
import { CopilotChatMessage, nonNullable } from './types/types'

/**
 * Copilot command, which can execute multiple actions.
 */
export interface CopilotCommand<Inputs extends any[] = any[]> {
  /**
   * Full name of the command
   */
  name?: string
  /**
   * Alias (short name) of the command
   */
  alias?: string
  /**
   * Description of the command
   */
  description: string
  /**
   * Examples of the command usage
   */
  examples?: string[]
  /**
   * Get system prompt message
   * 
   * @returns System prompt message
   */
  systemPrompt?: () => Promise<string>
  /**
   * 
   * @param args 
   * @returns 
   */
  implementation?: (...args: Inputs) => Promise<void | string | CopilotChatMessage>
  /**
   * @deprecated use `tools` instead
   */
  actions?: string[]
  /**
   * Tools for agent (langchain)
   */
  tools?: Array<DynamicStructuredTool | DynamicTool>
  /**
   * Prompt template for Agent executor
   */
  prompt?: any
  /**
   * Agent executor for command
   */
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
