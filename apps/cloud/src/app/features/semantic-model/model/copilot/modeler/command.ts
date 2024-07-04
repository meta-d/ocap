import { inject } from '@angular/core'
import { CopilotAgentType, CreateGraphOptions } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { injectCreateModelerGraph } from './graph'
import { injectCreateModelerPlanner } from './planner'
import { PLANNER_NAME } from './types'
import { DIMENSION_MODELER_NAME } from '../dimension'
import { CUBE_MODELER_NAME } from '../cube'

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
  return injectCopilotCommand(commandName, {
    alias: 'm',
    description: translate.instant('PAC.MODEL.Copilot.CommandModelerDesc', {
      Default: 'Describe model requirements or structure'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true,
      interruptAfter: [PLANNER_NAME, DIMENSION_MODELER_NAME, CUBE_MODELER_NAME]
    },
    historyCursor: () => {
      return modelService.getHistoryCursor()
    },
    revert: async (index: number) => {
      modelService.gotoHistoryCursor(index)
    },
    createGraph: async ({ llm }: CreateGraphOptions) => {
      return await createModelerGraph({
        llm
      })
    }
  })
}
