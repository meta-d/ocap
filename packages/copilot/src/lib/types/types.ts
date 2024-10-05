import { BaseMessage, FunctionCall, OpenAIToolCall } from '@langchain/core/messages'
import { AiProvider } from './providers'

export const DefaultModel = 'gpt-3.5-turbo'
export const DefaultBusinessRole = 'default'

export enum AiProviderRole {
  Primary = 'primary',
  Secondary = 'secondary'
}

export interface ICopilot {
  id?: string
  organizationId?: string
  enabled: boolean
  role: AiProviderRole
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

export interface CopilotBaseMessage {
  id: string
  createdAt?: Date
  role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool' | 'info' | 'component'
  
  /**
   * Status of the message:
   * - thinking: AI is thinking
   * - answering: AI is answering
   * - pending: AI is pending for confirm or more information
   * - done: AI is done
   * - aborted: AI is aborted
   * - error: AI has error
   */
  status?: 'thinking' | 'answering' | 'pending' | 'done' | 'aborted' | 'error'

  content?: string
}

/**
 */
export interface CopilotChatMessage extends CopilotBaseMessage {
  tool_call_id?: string
  /**
   * If the message has a role of `function`, the `name` field is the name of the function.
   * Otherwise, the name field should not be set.
   */
  name?: string

  /**
   * If the assistant role makes a function call, the `function_call` field
   * contains the function call name and arguments. Otherwise, the field should
   * not be set. (Deprecated and replaced by tool_calls.)
   */
  function_call?: string | FunctionCall
  data?: JSONValue
  /**
   * If the assistant role makes a tool call, the `tool_calls` field contains
   * the tool call name and arguments. Otherwise, the field should not be set.
   */
  tool_calls?: string | OpenAIToolCall[]
  /**
   * Additional message-specific information added on the server via StreamData
   */
  annotations?: JSONValue[] | undefined

  error?: string
  
  /**
   * Command name
   */
  command?: string

  historyCursor?: number
  reverted?: boolean

  lcMessage?: BaseMessage
}

export interface CopilotMessageGroup<T extends CopilotChatMessage = CopilotChatMessage> extends CopilotBaseMessage {
  messages: T[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CopilotChatResponseChoice {
  //
}

export const CopilotDefaultOptions = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2
}

export type BusinessRoleType = {
  name: string
  title: string
  titleCN: string
  description: string
}

export type Headers = Record<string, string | null | undefined>
export type RequestOptions = {
  headers?: Record<string, string> | Headers
  body?: object
}

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: JSONValue
    }
  | Array<JSONValue>

export type AIOptions = {
  model?: string
  temperature?: number | null;
  n?: number
  useSystemPrompt?: boolean
  verbose?: boolean
  interactive?: boolean
  recursionLimit?: number
}

export enum MessageDataType {
  Route = 'route',
  ToolsCall = 'tools_call',
}

export enum NgmLanguageEnum {
	Chinese = "zh-CN",
	SimplifiedChinese = "zh-Hans",
	TraditionalChinese = 'zh-Hant',
	English = 'en',
}

// Type guards
export function isMessageGroup<T extends CopilotChatMessage = CopilotChatMessage>(message: CopilotBaseMessage): message is CopilotMessageGroup<T> {
  return 'messages' in message;
}
