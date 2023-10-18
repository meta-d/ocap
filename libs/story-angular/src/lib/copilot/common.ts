import { StoryCopilotChatConversation } from "@metad/story/core";

export function logResult(copilot: StoryCopilotChatConversation) {
    const { logger, prompt } = copilot
    logger?.debug(`The result of prompt '${prompt}':`, copilot.response)
}