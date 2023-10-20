import { CopilotCommand, logResult } from '@metad/copilot'
import { StoryCopilotChatConversation } from '@metad/story/core'
import { switchMap, tap } from 'rxjs'
import { chatStoryStyle, modifyStory } from './chat'

export const StyleCommand = {
  name: 'style',
  description: 'Edit styles of story',
  examples: ['change theme to dark'],
  processor: (copilot: StoryCopilotChatConversation) => {
    return chatStoryStyle(copilot).pipe(tap<StoryCopilotChatConversation>(logResult), switchMap(modifyStory))
  }
} as CopilotCommand
