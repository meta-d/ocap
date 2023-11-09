import { CopilotCommand, logResult } from '@metad/copilot'
import { switchMap, tap } from 'rxjs'
import { ModelCopilotChatConversation } from '../types'
import { chatQuery, checkPrerequisite, createQuery } from './chat'

export * from './schema'

export const QueryCommand = {
  name: 'q',
  description: 'Create or edit statement for query cube',
  examples: ['query total sales amount by products'],
  processor: (copilot: ModelCopilotChatConversation) => {
    return checkPrerequisite(copilot).pipe(
      switchMap(chatQuery),
      tap(logResult),
      switchMap(createQuery)
    )
  }
} as CopilotCommand
