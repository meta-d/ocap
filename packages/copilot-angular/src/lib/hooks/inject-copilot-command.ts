import { DestroyRef, inject } from '@angular/core'
import { CopilotCommand } from '@metad/copilot'
import { NgmCopilotContextToken } from '../services'

/**
 * Inject a new copilot command
 * 
 * @param name 
 * @param command 
 * @returns 
 */
export function injectCopilotCommand(
  name: string | CopilotCommand,
  command?: CopilotCommand | Promise<CopilotCommand>
) {
  const copilotContext = inject(NgmCopilotContextToken)

  let commandName = ''
  if (typeof name === 'object') {
    command = name
    commandName = command.name
  } else {
    commandName = name
  }

  copilotContext.registerCommand(commandName, command)

  inject(DestroyRef).onDestroy(() => {
    copilotContext.unregisterCommand(commandName)
  })

  return commandName
}
