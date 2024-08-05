import { inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectCreateInsightGraph } from './graph'

export function injectInsightCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateInsightGraph()

  const commandName = 'insight'
  return injectCopilotCommand(commandName, {
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
