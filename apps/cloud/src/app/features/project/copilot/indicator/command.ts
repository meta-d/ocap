import { computed, inject } from '@angular/core'
import { ChatOpenAI } from '@langchain/openai'
import { CopilotAgentType } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { TranslateService } from '@ngx-translate/core'
import { injectDimensionMemberTool } from '@metad/core'
import { NGXLogger } from 'ngx-logger'
import { createIndicatorGraph } from './graph'
import { injectCreateIndicatorTool, injectPickCubeTool } from './tools'
import { injectCopilotRoleContext } from '../../../../@core/copilot'
import { ProjectService } from '../../project.service'

export function injectIndicatorCommand() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const copilotService = inject(NgmCopilotService)
  const projectService = inject(ProjectService)
  const copilotRoleContext = injectCopilotRoleContext()
  const createIndicatorTool = injectCreateIndicatorTool()
  const pickCubeTool = injectPickCubeTool()
  const memberRetrieverTool = injectDimensionMemberTool()

  const indicatorCodes = computed(() => projectService.indicators()?.map((indicator) => indicator.code) ?? [])
  const businessAreas = projectService.businessAreas
  const tags = projectService.tags

  const commandName = 'indicator'
  return injectCopilotCommand(
    commandName,
    (async () => {
      return {
        alias: 'i',
        description: 'Descripe the indicator business logic',
        agent: {
          type: CopilotAgentType.Graph,
          conversation: true
        },
        createGraph: async (llm: ChatOpenAI) => {
          return createIndicatorGraph({llm,
            pickCubeTool,
            createIndicatorTool,
            memberRetrieverTool,
            copilotRoleContext,
            indicatorCodes,
            businessAreas,
            tags
          })
        }
      }
    })()
  )
}
