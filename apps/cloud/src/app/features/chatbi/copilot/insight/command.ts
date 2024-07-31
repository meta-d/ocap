import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectCreateInsightGraph } from './graph'
import { CHATBI_COMMAND_NAME } from './types'

export function injectInsightCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateInsightGraph()

  return injectCopilotCommand(CHATBI_COMMAND_NAME, {
    alias: 'is',
    description: translate.instant('PAC.Home.Insight.ChartCommandDescription', {
      Default: 'Use charts to gain insights into data'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: ['tools']
    },
    createGraph
  })
}
