import { ChatCompletionCreateParams } from 'openai/resources'
import { AnnotatedFunction } from '../types'
import { ChatRequest, FunctionCall, Message } from 'ai';

export const defaultCopilotContextCategories = ['global']

export type FunctionCallHandler = (chatMessages: Message[], functionCall: FunctionCall) => Promise<ChatRequest | string | void>;

export function entryPointsToFunctionCallHandler(entryPoints: AnnotatedFunction<any[]>[]): FunctionCallHandler {
  return async (chatMessages, functionCall) => {
    const entrypointsByFunctionName: Record<string, AnnotatedFunction<any[]>> = {}
    for (const entryPoint of entryPoints) {
      entrypointsByFunctionName[entryPoint.name] = entryPoint
    }

    const entryPointFunction = entrypointsByFunctionName[functionCall.name || '']
    if (entryPointFunction) {
      let parsedFunctionCallArguments: Record<string, any>[] = []
      if (functionCall.arguments) {
        parsedFunctionCallArguments = JSON.parse(functionCall.arguments)
      }

      const paramsInCorrectOrder: any[] = []
      for (let arg of entryPointFunction.argumentAnnotations) {
        paramsInCorrectOrder.push(parsedFunctionCallArguments[arg.name as keyof typeof parsedFunctionCallArguments])
      }

      return await entryPointFunction.implementation(...paramsInCorrectOrder)

      // commented out becasue for now we don't want to return anything
      // const result = await entryPointFunction.implementation(
      //   ...parsedFunctionCallArguments
      // );
      // const functionResponse: ChatRequest = {
      //   messages: [
      //     ...chatMessages,
      //     {
      //       id: nanoid(),
      //       name: functionCall.name,
      //       role: 'function' as const,
      //       content: JSON.stringify(result),
      //     },
      //   ],
      // };

      // return functionResponse;
    }
  }
}

export function entryPointsToChatCompletionFunctions(
  entryPoints: AnnotatedFunction<any[]>[]
): ChatCompletionCreateParams.Function[] {
  return entryPoints.map(annotatedFunctionToChatCompletionFunction)
}

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
