import { ChatCompletionRequestMessage, CreateChatCompletionRequest, CreateChatCompletionResponseChoicesInner } from 'openai'

export interface ICopilot {
  enabled?: boolean
  provider: string
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
  System = "system",
  User = "user",
  Assistant = "assistant",
  Info = "info"
}

export interface CopilotChatMessage extends Omit<ChatCompletionRequestMessage, 'role'> {
  role: CopilotChatMessageRoleEnum
  error?: string
  data?: {
    columns: any[]
    content: any[]
  }
  end?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CopilotChatResponseChoice extends CreateChatCompletionResponseChoicesInner {
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

export type AIOptions = CreateChatCompletionRequest & {useSystemPrompt?: boolean}
