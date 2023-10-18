import { BehaviorSubject, Observable, filter, map } from 'rxjs'
import { CopilotChatConversation, nonNullable } from './types'


export interface CopilotCommand {
  name: string
  description: string
  examples?: string[]
  processor: <T extends CopilotChatConversation = CopilotChatConversation>(copilot: T) => Observable<T>
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

export const SystemCommands = ['/clear']

export function logResult<T extends CopilotChatConversation = CopilotChatConversation>(copilot: T): void {
  const { logger, prompt } = copilot
  logger?.debug(`The result of prompt '${prompt}':`, copilot.response)
}