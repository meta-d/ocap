import { Observable } from 'rxjs'
import { CopilotCommand } from './command'
import { CopilotService } from './copilot'
import { AIOptions, AnnotatedFunction, CopilotChatMessage, CopilotChatResponseChoice } from './types'

export type CopilotChatOptions = {
  command?: string
  newConversation?: boolean
  action?: string
  abortController?: AbortController
  assistantMessageId?: string
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
  conversations(): Array<CopilotChatMessage[]>

  messages(): CopilotChatMessage[]

  chat(prompt: string, options?: CopilotChatOptions): Promise<CopilotChatMessage | string | void>

  /**
   * @deprecated use `chat` instead
   */
  // process(
  //   data: { prompt: string; newConversation?: boolean; messages?: CopilotChatMessage[] },
  //   options?: { action?: string; abortController?: AbortController }
  // ): Observable<CopilotChatMessage | string | void>

  /**
   * @deprecated
   */
  preprocess?: (prompt: string, options?: any) => void
  /**
   * @deprecated
   */
  postprocess?(prompt: string, choices: CopilotChatResponseChoice[]): Observable<CopilotChatMessage[] | string>

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
  updateConversations?(fn: (conversations: Array<CopilotChatMessage[]>) => Array<CopilotChatMessage[]>): void
  /**
   * Update the last conversation messages
   * @param fn
   */
  updateLastConversation?(fn: (conversations: CopilotChatMessage[]) => CopilotChatMessage[]): void
}
