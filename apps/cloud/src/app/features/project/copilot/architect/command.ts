import { computed, inject } from '@angular/core'
import { ChatOpenAI } from '@langchain/openai'
import { CopilotAgentType, CreateGraphOptions } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectDimensionMemberTool } from '@metad/core'
import { NGXLogger } from 'ngx-logger'
import { injectAgentFewShotTemplate, injectCopilotRoleContext } from '../../../../@core/copilot'
import { ProjectService } from '../../project.service'
import { createIndicatorArchitectGraph } from './graph'
import { injectCreateIndicatorGraph } from '../indicator'
import { PLANNER_NAME } from './types'

export function injectIndicatorArchitectCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const projectService = inject(ProjectService)
  const copilotRoleContext = injectCopilotRoleContext()
  const createIndicatorGraph = injectCreateIndicatorGraph()

  const indicators = computed(() => projectService.indicators()?.map((indicator) => indicator) ?? [])
//   const businessAreas = projectService.businessAreas
//   const tags = projectService.tags

  const commandName = 'indicator-architect'
  const fewShotTemplate = injectAgentFewShotTemplate(commandName)
  return injectCopilotCommand(
    commandName,
    (async () => {
      return {
        alias: 'ia',
        description: translate.instant('PAC.INDICATOR.CommandIndicatorArchitectDesc', {Default: 'Descripe the indicator system architecture'}),
        agent: {
          type: CopilotAgentType.Graph,
          conversation: true,
          interruptAfter: [PLANNER_NAME]
        },
        createGraph: async ({llm, checkpointer}: CreateGraphOptions) => {
          return createIndicatorArchitectGraph({
            llm,
            checkpointer,
            copilotRoleContext,
            createIndicatorGraph,
            fewShotTemplate,
            indicators
          })
        }
      }
    })()
  )
}
