import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate, injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { injectCreateWidgetGraph } from './graph'
import { WIDGET_COMMAND_NAME } from './types'

export function injectStoryWidgetCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const referencesRetriever = injectExampleRetriever(`${WIDGET_COMMAND_NAME}/references`, { k: 3, vectorStore: null })
  const fewShotPrompt = injectAgentFewShotTemplate(WIDGET_COMMAND_NAME, { k: 1, vectorStore: null })
  const createGraph = injectCreateWidgetGraph()

  return injectCopilotCommand(WIDGET_COMMAND_NAME, {
    alias: 'w',
    description: translate.instant('PAC.Story.CommandWidgetDesc', {
      Default: 'Describe the widget you want'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools'],
      referencesRetriever
    },
    fewShotPrompt,
    createGraph
  })
}
