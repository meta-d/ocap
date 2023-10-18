import { CopilotCommand } from './types'
import { BehaviorSubject } from 'rxjs'

export const CopilotCommands$ = new BehaviorSubject<Record<string, CopilotCommand>>({})

export function registerCommand(command: CopilotCommand) {
  CopilotCommands$.next({
    ...CopilotCommands$.value,
    [command.name]: command
  })
}

export function getCommand(name: string) {
  return CopilotCommands$.value[name]
}

export * from './types'
