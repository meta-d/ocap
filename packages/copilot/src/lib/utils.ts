import { AIMessage } from '@langchain/core/messages'
import { ChatGenerationChunk } from '@langchain/core/outputs'
import { nanoid as _nanoid } from 'nanoid'
import { ZodType, ZodTypeDef } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export function zodToAnnotations(obj: ZodType<any, ZodTypeDef, any>) {
  return (<{ properties: any }>zodToJsonSchema(obj)).properties
}

export function nanoid() {
  return _nanoid()
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value != null
}

export function isNil(value: unknown): value is null | undefined {
  return value == null
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String
}

export function isBlank(value: unknown) {
  return isNil(value) || (isString(value) && !value.trim())
}

export function nonBlank<T>(value: T): value is NonNullable<T> {
  return !isBlank(value)
}

/**
 * Split the prompt into command and prompt
 *
 * @param prompt
 * @returns
 */
export function getCommandPrompt(prompt: string) {
  prompt = prompt.trim()
  // a regex match `/command prompt`
  const match = prompt.match(/^\/([a-zA-Z\-]*)\s*/i)
  const command = match?.[1]

  return {
    command,
    prompt: command ? prompt.replace(`/${command}`, '').trim() : prompt
  }
}

export function referencesCommandName(commandName: string) {
  return `${commandName}/references`
}

export const AgentRecursionLimit = 20

export function sumTokenUsage(output) {
  let tokenUsed = 0
  output.generations?.forEach((generation) => {
    generation.forEach((item) => {
      tokenUsed += (<AIMessage>(<ChatGenerationChunk>item).message).usage_metadata.total_tokens
    })
  })
  return tokenUsed
}
