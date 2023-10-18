import { CopilotChartConversation } from "@metad/story/core";

export function logResult(copilot: CopilotChartConversation) {
    const { logger, prompt } = copilot
    logger?.debug(`The result of prompt '${prompt}':`, copilot.response)
}