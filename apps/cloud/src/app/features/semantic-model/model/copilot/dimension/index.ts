import { CopilotCommand } from "@metad/copilot";
import { ModelCopilotChatConversation } from "../types";
import { of } from "rxjs";

export * from './schema'

export const DimensionCommand = {
    name: 'd',
    description: 'Edit dimension',
    examples: [
        'create dimension by table'
    ],
    processor: (copilot: ModelCopilotChatConversation) => {
        return of(copilot)
    }
} as CopilotCommand
