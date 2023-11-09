import { CopilotCommand, logResult } from '@metad/copilot'
import { switchMap, tap } from 'rxjs'
import { ModelCopilotChatConversation } from '../types'
import { chatCalculatedMeasure, checkPrerequisite, createCalculatedMeasure } from './chat'
import { chatFixCalculatedMeasure, checkCalculatedMemberPrerequisite, fixCalculatedMeasure } from './fix'

export * from './schema'

export const CalculatedMeasureCommand = {
  name: 'ccm',
  description: 'Create calcuated measure',
  examples: ['create calcuated measure'],
  processor: (copilot: ModelCopilotChatConversation) => {
    return checkPrerequisite(copilot).pipe(
      switchMap(chatCalculatedMeasure),
      tap(logResult),
      switchMap(createCalculatedMeasure)
    )
  }
} as CopilotCommand

export const FixCalculatedMeasureCommand = {
  name: 'fixcm',
  description: 'Fix calcuated measure',
  examples: ['The error is xxxx'],
  processor: (copilot: ModelCopilotChatConversation) => {
    return checkPrerequisite(copilot).pipe(
      switchMap(checkCalculatedMemberPrerequisite),
      switchMap(chatFixCalculatedMeasure),
      tap(logResult),
      switchMap(fixCalculatedMeasure)
    )
  }
} as CopilotCommand
