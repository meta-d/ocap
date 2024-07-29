import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectCreateStyleGraph } from './graph'
import { STORY_STYLE_COMMAND_NAME } from './types'
import { injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'

export function injectStoryStyleCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const createGraph = injectCreateStyleGraph()

  const examplesRetriever = injectExampleRetriever(STORY_STYLE_COMMAND_NAME, { k: 5, vectorStore: null })
  return injectCopilotCommand(STORY_STYLE_COMMAND_NAME, {
    alias: 'ss',
    description: translate.instant('PAC.Story.CommandStoryStyleDesc', {
      Default: 'Describe the style of story you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [
      ],
    },
    examplesRetriever,
    createGraph
  })
}
