import JSON5 from 'json5'
import { CopilotService } from '../copilot'
import { ChatCompletionMessage, ChatCompletionMessageParam, ChatCompletionSystemMessageParam } from 'openai/resources'

export const DefaultModel = 'gpt-3.5-turbo'

export interface ICopilot {
  enabled?: boolean
  provider?: string
  apiKey?: string
  apiHost?: string
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

export interface CopilotChatMessage extends Omit<ChatCompletionSystemMessageParam, 'role'> {
  role: CopilotChatMessageRoleEnum
  error?: string
  data?: {
    columns: any[]
    content: any[]
  }
  end?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CopilotChatResponseChoice {
  //
}

export const AI_PROVIDERS = {
  openai: {
    apiHost: 'https://api.openai.com',
    chatCompletionsUrl: '/v1/chat/completions'
  },
  azure: {
    apiHost: '',
    chatCompletionsUrl: '/v1/chat/completions'
  }
}

export type AIOptions = any & { useSystemPrompt?: boolean }

// Helper function
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

export function getCommandPrompt(prompt: string) {
  // a regex match `/command `
  const match = prompt.match(/\/([a-zA-Z\-]*)\s*/i)
  const command = match?.[1]

  return {
    command,
    prompt: prompt.replace(`/${command}`, '').trim()
  }
}

export interface CopilotChatConversation {

  command: string
  prompt: string
  options: any
  response?: { arguments: any } | any
  error?: string | Error

  copilotService: CopilotService
  logger?: {
    trace(message?: any | (() => any), ...additional: any[]): void;
    debug(message?: any | (() => any), ...additional: any[]): void;
    info(message?: any | (() => any), ...additional: any[]): void;
    log(message?: any | (() => any), ...additional: any[]): void;
    warn(message?: any | (() => any), ...additional: any[]): void;
    error(message?: any | (() => any), ...additional: any[]): void;
    fatal(message?: any | (() => any), ...additional: any[]): void;
  }
}

export const CopilotDefaultOptions = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value != null
}