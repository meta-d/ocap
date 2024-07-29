import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateStoryGraph } from './graph'
import { injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { STORY_COMMAND_NAME } from './types'

export function injectStoryCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const createGraph = injectCreateStoryGraph()

  const examplesRetriever = injectExampleRetriever(STORY_COMMAND_NAME, { k: 5, vectorStore: null })
  return injectCopilotCommand(STORY_COMMAND_NAME, {
    alias: 's',
    description: translate.instant('PAC.Story.CommandStoryDesc', {
      Default: 'Describe the story you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [
        'calculation',
        'page',
        'widget'
      ],
    },
    examplesRetriever,
    createGraph
  })
}
