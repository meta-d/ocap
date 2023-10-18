import { CopilotCommand } from "@metad/copilot";
import { ModelCopilotChatConversation } from "../types";
import { of, switchMap } from "rxjs";
import { chatCube, createCube } from "./chat";

export * from './schema'

export const CubeCommand = {
    name: 'c',
    description: 'Edit cube',
    examples: [
        'create cube by table'
    ],
    processor: (copilot: ModelCopilotChatConversation) => {
        return chatCube(copilot).pipe(switchMap(createCube))
    }
} as CopilotCommand
