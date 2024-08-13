import { CopilotAgentType } from "@metad/copilot";

const chatbiCommand = {
    alias: 'ci',
    hidden: true,
    description: 'ChatBI',
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools'],
      referencesRetriever
    },
    fewShotPrompt,
    createGraph
} as CopilotCommand