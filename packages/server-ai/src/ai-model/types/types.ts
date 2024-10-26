import { ICopilot } from "@metad/contracts"

export const PROVIDE_AI_MODEL_LLM = 'provide_ai_model_llm'
export const PROVIDE_AI_MODEL_MODERATION = 'provide_ai_model_moderation'
export const PROVIDE_AI_MODEL_SPEECH2TEXT = 'provide_ai_model_speech2text'
export const PROVIDE_AI_MODEL_TEXT_EMBEDDING = 'provide_ai_model_text_embedding'

export type TChatModelOptions = {handleLLMTokens: (input: {copilot: ICopilot, tokenUsed: number}) => void}