import { ChatConversation, Copilot, CopilotCheckpoint, CopilotCheckpointWrites, CopilotKnowledge, CopilotOrganization, CopilotRole, CopilotUser, Knowledgebase, KnowledgeDocument } from "./internal";

export const ALL_AI_ENTITIES = [
    Copilot,
    CopilotKnowledge,
    CopilotRole,
    CopilotOrganization,
    CopilotUser,
    CopilotCheckpoint,
    CopilotCheckpointWrites,
    Knowledgebase,
    KnowledgeDocument,
    ChatConversation
]