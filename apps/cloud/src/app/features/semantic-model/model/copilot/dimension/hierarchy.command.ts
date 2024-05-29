import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import { makeTablePrompt } from '@metad/core'
import { createAgentPromptTemplate, injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { EntityType, PropertyHierarchy } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { ModelDimensionService } from '../../dimension/dimension.service'
import { HierarchySchema } from '../schema'

export function injectHierarchyCommand(dimensionService: ModelDimensionService, tableTypes: Signal<EntityType[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const dimension = toSignal(dimensionService.dimension$)

  const createHierarchyTool = new DynamicStructuredTool({
    name: 'createHierarchy',
    description: 'Create or edit hierarchy in dimension.',
    schema: HierarchySchema,
    func: async (h) => {
      logger.debug(`Execute copilot action 'createHierarchy':`, h)
      dimensionService.newHierarchy(h as Partial<PropertyHierarchy>)
      return translate.instant('PAC.MODEL.Copilot.CreatedHierarchy', { Default: 'Created hierarchy!' })
    }
  })

  const commandName = 'hierarchy'
  return injectCopilotCommand(commandName, {
    alias: 'h',
    description: translate.instant('PAC.MODEL.Copilot.CreateHierarchy', { Default: 'Create a new hierarchy' }),
    agent: {
      type: CopilotAgentType.Default
    },
    tools: [createHierarchyTool],
    prompt:
      createAgentPromptTemplate(`You are a cube modeling expert. Let's create a hierarchy in the dimension for cube!
名称不要与现有名称重复，并且名称要尽量简短。
层次结构中的 Levels 顺序一般按照所使用字段在现实中的含义由上到下（或者叫由粗粒度到细粒度）排列，例如：年份、季度、月份、日期。

{context}
    
{system_prompt}`),
    systemPrompt: async () => {
      return `当前维度信息为：
\`\`\`
${JSON.stringify(dimension())}
\`\`\`
当前维度已使用到的表信息：
\`\`\`
${tableTypes()
  .map((tableType) => makeTablePrompt(tableType))
  .join('\n')}
\`\`\`
`
    }
  })
}
