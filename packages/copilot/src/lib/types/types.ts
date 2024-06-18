import { Message } from 'ai'
import { BaseMessage } from '@langchain/core/messages'
import JSON5 from 'json5'
import { ChatCompletionMessage } from 'openai/resources'
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions'
import { AiProvider } from './providers'

export const DefaultModel = 'gpt-3.5-turbo'
export const DefaultBusinessRole = 'default'

export interface ICopilot {
  enabled: boolean
  provider?: AiProvider
  /**
   * Authorization key for the API
   */
  apiKey?: string
  /**
   * API Host or proxy host
   */
  apiHost?: string
  /**
   * Authorization token for the API
   */
  token?: string
  /**
   * Default model to use
   */
  defaultModel: string

  chatUrl?: string
  modelsUrl?: string

  /**
   * Show tokens for message
   */
  showTokenizer?: boolean
}

export interface BusinessOperation {
  businessArea: string
  action: string
  prompts: Record<string, string>
  language: 'css' | 'javascript' | 'sql' | 'mdx'
  format: 'json' | 'text'
  value: any
}

export enum CopilotChatMessageRoleEnum {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  Info = 'info'
}

/**
 * @deprecated remove Message from `ai` package
 */
export interface CopilotChatMessage extends Omit<Message, 'role'> {
  error?: string

  role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool' | 'info'
  /**
   * Command name
   */
  command?: string

  status?: 'thinking' | 'answering' | 'done' | 'error' | 'info'

  lcMessage?: BaseMessage

  historyCursor?: number
  reverted?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CopilotChatResponseChoice {
  //
}

/**
 * @deprecated use LangChain
 */
export type AIOptions = ChatCompletionCreateParamsBase & { useSystemPrompt?: boolean; verbose?: boolean }

// Helper function
/**
 * @deprecated use LangChain
 */
export function getFunctionCall(message: ChatCompletionMessage, name?: string) {
  if (message.role !== CopilotChatMessageRoleEnum.Assistant) {
    throw new Error('Only assistant messages can be used to generate function calls')
  }

  if (name && name !== message.function_call.name) {
    throw new Error(`The message is not the function call '${name}'`)
  }

  return {
    name: message.function_call.name,
    arguments: JSON5.parse(message.function_call.arguments)
  }
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

export const CopilotDefaultOptions = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value != null
}

export type BusinessRoleType = {
  name: string;
  title: string;
  titleCN: string;
  description: string;
}

export type Headers = Record<string, string | null | undefined>;
export type RequestOptions = {
  headers?: Record<string, string> | Headers;
  body?: object;
}