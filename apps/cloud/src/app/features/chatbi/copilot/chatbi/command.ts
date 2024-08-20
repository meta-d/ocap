import { inject } from '@angular/core'
import { CopilotAgentType, referencesCommandName } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate, injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { injectCreateInsightGraph } from './graph'
import { CHATBI_COMMAND_NAME } from './types'

export function injectInsightCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateInsightGraph()

  // const referencesRetriever = injectExampleRetriever(
  //   [referencesCommandName(CHATBI_COMMAND_NAME), referencesCommandName('calculated')],
  //   { k: 3, vectorStore: null }
  // )
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
      interruptBefore: ['tools'],
      // referencesRetriever
    },
    fewShotPrompt,
    createGraph
  })
}
