import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { injectCreateInsightGraph } from './graph'
import { CHATBI_COMMAND_NAME } from './types'

export function injectInsightCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateInsightGraph()

  const fewShotPrompt = injectAgentFewShotTemplate(CHATBI_COMMAND_NAME, { k: 1, vectorStore: null })
  return injectCopilotCommand(CHATBI_COMMAND_NAME, {
    alias: 'ci',
    hidden: true,
    description: translate.instant('PAC.Home.Insight.ChartCommandDescription', {
      Default: 'Use charts to gain insights into data'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    fewShotPrompt,
    createGraph
  })
}
