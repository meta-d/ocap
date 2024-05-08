import { DestroyRef, inject } from '@angular/core'
import { CopilotCommand } from '@metad/copilot'
import { NgmCopilotEngineService } from '../services'

export function injectCopilotCommand(name: string | CopilotCommand, command?: CopilotCommand | Promise<CopilotCommand>) {
  const copilotEngine = inject(NgmCopilotEngineService)

  let commandName = ''
  if (typeof name === 'object') {
    command = name
    commandName = command.name
  } else {
    commandName = name
  }

  copilotEngine.registerCommand(commandName, command)

  inject(DestroyRef).onDestroy(() => {
    copilotEngine.unregisterCommand(commandName)
  })

  return commandName
}