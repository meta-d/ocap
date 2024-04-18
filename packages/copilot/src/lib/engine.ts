import { CopilotCommand } from './command'
import { CopilotService } from './copilot'
import { AIOptions, AnnotatedFunction, CopilotChatMessage } from './types'

export type CopilotChatOptions = {
  command?: string
  newConversation?: boolean
  action?: string
  abortController?: AbortController
  assistantMessageId?: string
  conversationId?: string
}

export type CopilotChatConversation<T extends CopilotChatMessage = CopilotChatMessage> = {
  id: string
  messages: T[]
}

/**
 * Copilot engine
 */
export interface CopilotEngine {
  copilot?: CopilotService

  /**
   * Copilot engine name
   */
  name?: string
  /**
   * Placeholder in ask input
   */
  placeholder?: string
  /**
   * AI Configuration
   */
  aiOptions: AIOptions
  /**
   * System prompt
   */
  systemPrompt?: string
  /**
   * Predefined prompts
   * @deprecated use commands instead
   */
  prompts?: string[]

  /**
   * Conversations
   */
  conversations(): Array<CopilotChatConversation>

  messages(): CopilotChatMessage[]

  chat(prompt: string, options?: CopilotChatOptions): Promise<CopilotChatMessage | string | void>

  /**
   * How to process the event when user drag drop a data
   *
   * @param event
   */
  dropCopilot?: (event) => void

  setEntryPoint?: (id: string, entryPoint: AnnotatedFunction<any[]>) => void
  removeEntryPoint?: (id: string) => void
  registerCommand?(area: string, command: CopilotCommand): void
  unregisterCommand?(area: string, name: string): void

  /**
   * Get all commands in this copilot engine
   *
   * @returns CopilotCommand[]
   */
  commands?: () => CopilotCommand[]

  /**
   * Update or insert the message into conversations
   *
   * @param message
   */
  upsertMessage?(message: CopilotChatMessage): void

  /**
   * Delete message from conversation
   *
   * @param message
   */
  deleteMessage?(message: CopilotChatMessage | string): void

  /**
   * Clear conversations
   */
  clear(): void

  /**
   * Update conversations value
   *
   * @param fn
   */
  updateConversations?(fn: (conversations: Array<CopilotChatConversation>) => Array<CopilotChatConversation>): void
  /**
   * Update the last conversation messages
   * @param fn
   */
  updateLastConversation?(fn: (conversation: CopilotChatConversation) => CopilotChatConversation): void
}
