import { DestroyRef, inject } from '@angular/core'
import { CopilotCommand } from '@metad/copilot'
import { NgmCopilotEngineService } from '../services'

export function injectCopilotCommand(command: CopilotCommand) {
  const copilotEngine = inject(NgmCopilotEngineService)
  copilotEngine.registerCommand(command.name, command)

  inject(DestroyRef).onDestroy(() => {
    copilotEngine.unregisterCommand(command.name)
  })

  return command.name
}
