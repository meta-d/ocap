import { DestroyRef, inject } from '@angular/core'
import { AnnotatedFunction } from '@metad/copilot'
import { nanoid } from 'nanoid'
import { NgmCopilotEngineService } from '../services'

export function injectMakeCopilotActionable<ActionInput extends any[]>(
  annotatedFunction: AnnotatedFunction<ActionInput>
) {
  const idRef = nanoid() // generate a unique id
  const copilotEngine = inject(NgmCopilotEngineService)

  const memoizedAnnotatedFunction: AnnotatedFunction<ActionInput> = {
    name: annotatedFunction.name,
    description: annotatedFunction.description,
    argumentAnnotations: annotatedFunction.argumentAnnotations,
    implementation: annotatedFunction.implementation
  }

  copilotEngine.setEntryPoint(idRef, memoizedAnnotatedFunction as AnnotatedFunction<any[]>)

  inject(DestroyRef).onDestroy(() => {
    copilotEngine.removeEntryPoint(idRef)
  })

  return idRef
}
