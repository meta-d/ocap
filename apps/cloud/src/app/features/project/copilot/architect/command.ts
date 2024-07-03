import { computed, inject } from '@angular/core'
import { CopilotAgentType } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { injectAgentFewShotTemplate } from '../../../../@core/copilot'
import { ProjectService } from '../../project.service'
import { injectCreateIndicatorArchitect } from './graph'
import { INDICATOR_AGENT_NAME, PLANNER_NAME } from './types'

export function injectIndicatorArchitectCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const projectService = inject(ProjectService)
  const createIndicatorGraph = injectCreateIndicatorArchitect()

  const indicators = computed(() => projectService.indicators() ?? [])
  //   const businessAreas = projectService.businessAreas
  //   const tags = projectService.tags

  // Planner command
  // injectCopilotCommand('ia-plan', {
  //   hidden: true,
  //   alias: 'iap',
  //   description: 'Plan command for indicator system architect',
  //   agent: {
  //     type: CopilotAgentType.Graph,
  //     conversation: true,
  //     interruptAfter: ['tools']
  //   },
  //   createGraph: async ({llm}: CreateGraphOptions) => {
  //     return await createIndicatorArchitectPlanner({ llm })
  //   }
  // })

  const commandName = 'indicator-architect'
  const fewShotPrompt = injectAgentFewShotTemplate(commandName)
  return injectCopilotCommand(
    commandName,
    {
      alias: 'ia',
      description: translate.instant('PAC.INDICATOR.CommandIndicatorArchitectDesc', {
        Default: 'Descripe the indicator system architecture'
      }),
      agent: {
        type: CopilotAgentType.Graph,
        conversation: true,
        interruptAfter: [PLANNER_NAME, INDICATOR_AGENT_NAME]
      },
      fewShotPrompt,
      createGraph: createIndicatorGraph
    }
  )
}
