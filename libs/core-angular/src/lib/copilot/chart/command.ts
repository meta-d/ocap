import { inject, Signal } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCommandFewShotPrompt, injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectCreateChartGraph } from './graph'

export function injectChartCommand(logic: Signal<string>, createChart: (chart: {logic: string}) => Promise<string>) {
  const translate = inject(TranslateService)
  const createGraph = injectCreateChartGraph(logic, createChart)
  const fewShotPrompt = injectCommandFewShotPrompt('chart', {k: 2, vectorStore: null})

  const commandName = 'chart'
  return injectCopilotCommand(commandName, {
    alias: 'cr',
    description: translate.instant('PAC.Copilot.CommandChartDesc', {
      Default: 'Descripe the business logic of chart'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: []
    },
    fewShotPrompt,
    createGraph
  })
}
