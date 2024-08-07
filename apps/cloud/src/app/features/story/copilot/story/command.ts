import { inject } from '@angular/core'
import { CopilotAgentType, referencesCommandName } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate, injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { injectCreateStoryGraph } from './graph'
import { STORY_COMMAND_NAME } from './types'

export function injectStoryCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const createGraph = injectCreateStoryGraph()

  const referencesRetriever = injectExampleRetriever(referencesCommandName(STORY_COMMAND_NAME), { k: 3, vectorStore: null })
  const examplesRetriever = injectExampleRetriever(STORY_COMMAND_NAME, { k: 5, vectorStore: null })
  const fewShotPrompt = injectAgentFewShotTemplate(STORY_COMMAND_NAME, { k: 1, vectorStore: null })
  return injectCopilotCommand(STORY_COMMAND_NAME, {
    alias: 's',
    description: translate.instant('PAC.Story.CommandStoryDesc', {
      Default: 'Describe the story you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['calculation', 'page', 'widget', 'style'],
      referencesRetriever
    },
    examplesRetriever,
    fewShotPrompt,
    createGraph
  })
}
