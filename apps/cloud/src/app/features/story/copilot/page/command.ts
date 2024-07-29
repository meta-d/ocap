import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { NxStoryService } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate, injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { injectCreatePageGraph } from './graph'
import { STORY_PAGE_COMMAND_NAME } from './types'

export function injectStoryPageCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const storyService = inject(NxStoryService)

  const createGraph = injectCreatePageGraph()

  const examplesRetriever = injectExampleRetriever(STORY_PAGE_COMMAND_NAME, { k: 5, vectorStore: null })
  const fewShotPrompt = injectAgentFewShotTemplate(STORY_PAGE_COMMAND_NAME, { k: 1, vectorStore: null })

  return injectCopilotCommand(STORY_PAGE_COMMAND_NAME, {
    alias: 'p',
    description: translate.instant('Story.Copilot.CommandPageDesc', { Default: 'Describe the page you want' }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    examplesRetriever,
    fewShotPrompt,
    createGraph
  })
}
