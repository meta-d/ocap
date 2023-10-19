import { CopilotCommand, logResult } from "@metad/copilot";
import { ModelCopilotChatConversation } from "../types";
import { switchMap, tap } from "rxjs";
import { chatDimension, createDimension } from "./chat";

export * from './schema'

export const DimensionCommand = {
    name: 'd',
    description: 'Edit dimension',
    examples: [
        'create dimension by table'
    ],
    processor: (copilot: ModelCopilotChatConversation) => {
        return chatDimension(copilot).pipe(
            tap<ModelCopilotChatConversation>(logResult),
            switchMap(createDimension)
        )
    }
} as CopilotCommand
