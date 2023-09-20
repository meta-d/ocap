import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  CreateChatCompletionResponseChoicesInner
} from 'openai'

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
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  Info = 'info'
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

export type AIOptions = CreateChatCompletionRequest & { useSystemPrompt?: boolean }

// Helper function
export function getFunctionCall(message: ChatCompletionRequestMessage, name?: string) {
  if (message.role !== CopilotChatMessageRoleEnum.Assistant) {
    throw new Error('Only assistant messages can be used to generate function calls')
  }

  if (name && name !== message.function_call.name) {
    throw new Error(`The message is not the function call '${name}'`)
  }

  return {
    name: message.function_call.name,
    arguments: JSON.parse(message.function_call.arguments)
  }
}
