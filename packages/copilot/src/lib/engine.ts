import { Observable } from 'rxjs'
import { AIOptions, AnnotatedFunction, CopilotChatMessage, CopilotChatResponseChoice } from './types'

/**
 * Copilot engine
 */
export interface CopilotEngine {
  /**
   * Copilot engine name
   */
  name?: string
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
   */
  prompts?: string[]
  /**
   * Conversations
   */
  conversations: CopilotChatMessage[]
  /**
   * Placeholder in ask input
   */
  placeholder?: string

  process(
    data: { prompt: string; messages?: CopilotChatMessage[] },
    options?: { action?: string }
  ): Observable<CopilotChatMessage[] | string>
  preprocess?: (prompt: string, options?: any) => void
  postprocess?(prompt: string, choices: CopilotChatResponseChoice[]): Observable<CopilotChatMessage[] | string>

  /**
   * Drop copilot data
   *
   * @param event
   */
  dropCopilot?: (event) => void

  setEntryPoint?: (id: string, entryPoint: AnnotatedFunction<any[]>) => void
  removeEntryPoint?: (id: string) => void
}
