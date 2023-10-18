import { CopilotCommand } from '@metad/copilot'
import { StoryCopilotChatConversation } from '@metad/story/core'
import { switchMap, tap } from 'rxjs'
import { logResult } from '../common'
import { chatStoryStyle, modifyStory } from './chat'

export const StyleCommand = {
  name: 'style',
  description: 'Edit styles of story',
  examples: ['change theme to dark'],
  processor: (copilot: StoryCopilotChatConversation) => {
    return chatStoryStyle(copilot).pipe(tap(logResult), switchMap(modifyStory))
  }
} as CopilotCommand
