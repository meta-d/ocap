import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreatePageAgent } from './graph'
import { STORY_PAGE_COMMAND_NAME } from './types'
import { TranslateService } from '@ngx-translate/core'

export function injectStoryPageCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const storyService = inject(NxStoryService)

  const createGraph = injectCreatePageAgent()

  return injectCopilotCommand(STORY_PAGE_COMMAND_NAME, {
    alias: 'p',
    description: translate.instant('Story.Copilot.CommandPageDesc', {Default: 'Describe the page you want'}),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    createGraph
  })
}
