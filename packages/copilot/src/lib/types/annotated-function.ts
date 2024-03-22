import { CopilotChatMessage } from './types'

export interface AnnotatedFunctionSimpleArgument {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' // Add or change types according to your needs.
  description: string
  required: boolean
  properties?: any
}

export interface AnnotatedFunctionArrayArgument {
  name: string
  type: 'array'
  items: {
    type: string
    properties?: any
  }
  description: string
  required: boolean
}

export type AnnotatedFunctionArgument = AnnotatedFunctionSimpleArgument | AnnotatedFunctionArrayArgument

export interface AnnotatedFunction<Inputs extends any[]> {
  name: string
  description: string
  argumentAnnotations: AnnotatedFunctionArgument[]
  implementation: (...args: Inputs) => Promise<CopilotChatMessage | string | void>
}
