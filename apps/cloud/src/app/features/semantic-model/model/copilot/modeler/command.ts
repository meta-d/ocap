import { inject } from '@angular/core'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { CopilotAgentType, CreateGraphOptions, Team } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate, injectExampleRetriever } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { CUBE_MODELER_NAME } from '../cube'
import { DIMENSION_MODELER_NAME } from '../dimension'
import { injectCreateModelerGraph } from './graph'
import { MODELER_COMMAND_NAME } from './types'

export function injectModelerCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const createModelerGraph = injectCreateModelerGraph()

  const examplesRetriever = injectExampleRetriever(MODELER_COMMAND_NAME, { k: 5, vectorStore: null })
  const fewShotPrompt = injectAgentFewShotTemplate(MODELER_COMMAND_NAME, { k: 1, vectorStore: null })
  return injectCopilotCommand(MODELER_COMMAND_NAME, {
    alias: 'm',
    description: translate.instant('PAC.MODEL.Copilot.CommandModelerDesc', {
      Default: 'Describe model requirements or structure'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptBefore: [Team.TOOLS_NAME, DIMENSION_MODELER_NAME, CUBE_MODELER_NAME]
    },
    historyCursor: () => {
      return modelService.getHistoryCursor()
    },
    revert: async (index: number) => {
      modelService.gotoHistoryCursor(index)
    },
    fewShotPrompt,
    createGraph: async ({ llm }: CreateGraphOptions) => {
      return await createModelerGraph({
        llm
      })
    },
    examplesRetriever,
    suggestion: {
      promptTemplate: ChatPromptTemplate.fromMessages([
        ['system', `用简短的一句话补全用户可能的提问，仅输出源提示后面补全的内容，不需要解释，使用与原提示同样的语言`],
        ['human', '{input}']
      ])
    }
  })
}
