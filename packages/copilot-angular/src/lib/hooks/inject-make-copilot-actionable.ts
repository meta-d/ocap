// import { DestroyRef, inject } from '@angular/core'
// import { nanoid } from 'nanoid'
// import { NgmCopilotContextToken } from '../services/'

// /**
//  * @deprecated use tools in LangChain instead
//  */
// export function injectMakeCopilotActionable<ActionInput extends any[]>(
//   annotatedFunction: AnnotatedFunction<ActionInput>
// ) {
//   const idRef = nanoid() // generate a unique id
//   const copilotContext = inject(NgmCopilotContextToken)

//   const memoizedAnnotatedFunction: AnnotatedFunction<ActionInput> = {
//     name: annotatedFunction.name,
//     description: annotatedFunction.description,
//     argumentAnnotations: annotatedFunction.argumentAnnotations,
//     implementation: annotatedFunction.implementation
//   }

//   copilotContext.setEntryPoint(idRef, memoizedAnnotatedFunction as AnnotatedFunction<any[]>)

//   inject(DestroyRef).onDestroy(() => {
//     copilotContext.removeEntryPoint(idRef)
//   })

//   return idRef
// }
