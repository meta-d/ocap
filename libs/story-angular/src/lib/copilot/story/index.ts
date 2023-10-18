import { CopilotChartConversation } from '@metad/story/core'
import { switchMap, tap } from 'rxjs'
import { logResult } from '../common'
import { createStoryPage, smartDiscover } from './chat'

export const StoryCommand = {
  name: 'story',
  description: 'New story',
  examples: ['create new story with 3 pages for sales'],
  processor: (copilot: CopilotChartConversation) => {
    return smartDiscover(copilot).pipe(tap(logResult), switchMap(createStoryPage))
  }
}
