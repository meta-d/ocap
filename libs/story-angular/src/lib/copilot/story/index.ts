import { CopilotCommand, logResult } from '@metad/copilot'
import { StoryCopilotChatConversation } from '@metad/story/core'
import { switchMap, tap } from 'rxjs'
import { createStoryPage, smartDiscover } from './chat'
import { checkDefaultEntity } from '../common'

export const StoryCommand = {
  name: 'story',
  description: 'New story',
  examples: ['create new story with 3 pages for sales'],
  processor: (copilot: StoryCopilotChatConversation) => {
    return checkDefaultEntity(copilot).pipe(
      switchMap(smartDiscover),
      tap<StoryCopilotChatConversation>(logResult),
      switchMap(createStoryPage)
    )
  }
} as CopilotCommand
