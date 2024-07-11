import { ChatRequest, FunctionCall, Message, nanoid } from 'ai'
import { ChatCompletionCreateParams } from 'openai/resources'
import JSON5 from 'json5'
import { AnnotatedFunction } from '../types'

export const defaultCopilotContextCategories = ['global']

/**
 * @deprecated use LangChain
 */
export type FunctionCallHandler = (
  chatMessages: Message[],
  functionCall: FunctionCall,
  conversationId: string
) => Promise<ChatRequest | string | void>

export type FunctionCallHandlerOptions = {
  conversationId: string
  messages: Message[]
}

export function entryPointsToFunctionCallHandler(entryPoints: AnnotatedFunction<any[]>[]): FunctionCallHandler {
  return async (chatMessages, functionCall, conversationId): Promise<ChatRequest | string | void> => {
    const entrypointsByFunctionName: Record<string, AnnotatedFunction<any[]>> = {}
    for (const entryPoint of entryPoints) {
      entrypointsByFunctionName[entryPoint.name] = entryPoint
    }

    const entryPointFunction = entrypointsByFunctionName[functionCall.name || '']
    if (entryPointFunction) {
      let parsedFunctionCallArguments: Record<string, any>[] = []
      if (functionCall.arguments) {
        parsedFunctionCallArguments = JSON5.parse(functionCall.arguments)
      }

      const paramsInCorrectOrder: any[] = []
      for (const arg of entryPointFunction.argumentAnnotations) {
        paramsInCorrectOrder.push(parsedFunctionCallArguments[arg.name as keyof typeof parsedFunctionCallArguments])
      }

      // return await entryPointFunction.implementation(...paramsInCorrectOrder)
      const result = await entryPointFunction.implementation(...paramsInCorrectOrder, {conversationId, messages: chatMessages})
      if (!result) {
        return
      }
      if (typeof result === 'string') {
        return result
      }
      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            ...result,
            id: nanoid(),
            name: functionCall.name,
            role: 'function' as const
          }
        ]
      }
      return functionResponse
    }
  }
}

/**
 * @deprecated use LangChain
 */
export function entryPointsToChatCompletionFunctions(
  entryPoints: AnnotatedFunction<any[]>[]
): ChatCompletionCreateParams.Function[] {
  return entryPoints.map(annotatedFunctionToChatCompletionFunction)
}

/**
 * @deprecated use LangChain
 */
export function annotatedFunctionToChatCompletionFunction(
  annotatedFunction: AnnotatedFunction<any[]>
): ChatCompletionCreateParams.Function {
  // Create the parameters object based on the argumentAnnotations
  const parameters: { [key: string]: any } = {}
  for (const arg of annotatedFunction.argumentAnnotations) {
    // isolate the args we should forward inline
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, required, ...forwardedArgs } = arg
    parameters[arg.name] = forwardedArgs
  }

  const requiredParameterNames: string[] = []
  for (const arg of annotatedFunction.argumentAnnotations) {
    if (arg.required) {
      requiredParameterNames.push(arg.name)
    }
  }

  // Create the ChatCompletionFunctions object
  const chatCompletionFunction: ChatCompletionCreateParams.Function = {
    name: annotatedFunction.name,
    description: annotatedFunction.description,
    parameters: {
      type: 'object',
      properties: parameters,
      required: requiredParameterNames
    }
  }

  return chatCompletionFunction
}
