import { inject } from '@angular/core'
import { CopilotAgentType, CreateGraphOptions, Team } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { CUBE_MODELER_NAME } from '../cube'
import { DIMENSION_MODELER_NAME } from '../dimension'
import { injectCreateModelerGraph } from './graph'
import { injectCreateModelerPlanner } from './planner'

export function injectModelerCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)
  const createModelerPlanner = injectCreateModelerPlanner()

  const createModelerGraph = injectCreateModelerGraph()

  injectCopilotCommand('modeler-plan', {
    hidden: true,
    alias: 'mlp',
    description: 'Plan command for semantic model',
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptAfter: ['tools']
    },
    createGraph: async ({ llm }: CreateGraphOptions) => {
      return await createModelerPlanner({ llm })
    }
  })

  const commandName = 'modeler'
  const fewShotPrompt = injectAgentFewShotTemplate(commandName, { k: 1, vectorStore: null })
  return injectCopilotCommand(commandName, {
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
    }
  })
}
