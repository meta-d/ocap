// import { CopilotChatMessage } from './types'

// /**
//  * @deprecated use tools in LangChain instead
//  */
// export interface AnnotatedFunctionSimpleArgument {
//   name: string
//   type: 'string' | 'number' | 'boolean' | 'object' // Add or change types according to your needs.
//   description: string
//   required: boolean
//   properties?: any
// }

// /**
//  * @deprecated use tools in LangChain instead
//  */
// export interface AnnotatedFunctionArrayArgument {
//   name: string
//   type: 'array'
//   items: {
//     type: string
//     properties?: any
//   }
//   description: string
//   required: boolean
// }

// /**
//  * @deprecated use tools in LangChain instead
//  */
// export type AnnotatedFunctionArgument = AnnotatedFunctionSimpleArgument | AnnotatedFunctionArrayArgument

// /**
//  * @deprecated use tools in LangChain instead
//  */
// export interface AnnotatedFunction<Inputs extends any[]> {
//   name: string
//   description: string
//   argumentAnnotations: AnnotatedFunctionArgument[]
//   implementation: (...args: Inputs) => Promise<CopilotChatMessage | string | void>
// }
