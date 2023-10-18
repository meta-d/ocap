import { CopilotCommand, logResult } from "@metad/copilot";
import { switchMap, tap } from "rxjs";
import { ModelCopilotChatConversation } from "../types";
import { chatCalculatedMeasure, createCalculatedMeasure } from "./chat";

export * from './schema';

export const CalculatedMeasureCommand = {
  name: 'ccm',
  description: 'Create calcuated measure',
  examples: ['create calcuated measure'],
  processor: (copilot: ModelCopilotChatConversation) => {
    return chatCalculatedMeasure(copilot).pipe(tap(logResult), switchMap(createCalculatedMeasure))
  }
} as CopilotCommand
