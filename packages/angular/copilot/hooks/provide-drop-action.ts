import { DestroyRef, inject } from '@angular/core'
import { NgmCopilotEngineService } from '../services'
import { DropAction } from '../types'

export function provideCopilotDropAction(action: DropAction) {
  const copilotEngine = inject(NgmCopilotEngineService)
  copilotEngine.registerDropAction(action)

  inject(DestroyRef).onDestroy(() => {
    copilotEngine.unregisterDropAction(action.id)
  })

  return action.id
}
