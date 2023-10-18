import { CopilotChartConversation } from '@metad/story/core'
import { switchMap, tap } from 'rxjs'
import { logResult } from '../common'
import { chatStoryStyle, modifyStory } from './chat'

export const StyleCommand = {
  name: 'style',
  description: 'Edit styles of story',
  examples: ['change theme to dark'],
  processor: (copilot: CopilotChartConversation) => {
    return chatStoryStyle(copilot).pipe(
      tap(logResult),
      switchMap(modifyStory)
    )
  }
}
