import { computed, inject } from '@angular/core'
import { CopilotAgentType, CreateGraphOptions } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { injectDimensionMemberTool } from '@metad/core'
import { TranslateService } from '@ngx-translate/core'
import { injectCopilotRoleContext } from '../../../../@core/copilot'
import { ProjectService } from '../../project.service'
import { createIndicatorGraph } from './graph'
import { injectCreateIndicatorTool, injectPickCubeTool, injectCreateFormulaTool } from './tools'

export function injectIndicatorCommand() {
  const translate = inject(TranslateService)
  const createGraph = injectCreateIndicatorGraph()

  const commandName = 'indicator'
  return injectCopilotCommand(commandName,
    {
      alias: 'i',
      description: translate.instant('PAC.INDICATOR.CommandIndicatorDesc', {Default: 'Descripe the indicator business logic'}),
      agent: {
        type: CopilotAgentType.Graph,
        conversation: true
      },
      createGraph
    }
  )
}

export function injectCreateIndicatorGraph() {
  const projectService = inject(ProjectService)
  const copilotRoleContext = injectCopilotRoleContext()
  const createIndicatorTool = injectCreateIndicatorTool()
  const pickCubeTool = injectPickCubeTool()
  const memberRetrieverTool = injectDimensionMemberTool()
  const createFormulaTool = injectCreateFormulaTool()

  const indicatorCodes = computed(() => projectService.indicators()?.map((indicator) => indicator.code) ?? [])
  const businessAreas = projectService.businessAreas
  const tags = projectService.tags

  return async ({llm, checkpointer}: CreateGraphOptions) => {
    return createIndicatorGraph({
      llm,
      checkpointer,
      pickCubeTool,
      createIndicatorTool,
      memberRetrieverTool,
      createFormulaTool,
      copilotRoleContext,
      indicatorCodes,
      businessAreas,
      tags
    })
  }
}
