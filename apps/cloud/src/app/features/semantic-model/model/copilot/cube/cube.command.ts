import { Signal, inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import { createAgentPromptTemplate, injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { Property } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { CubeSchema } from '../schema'
import { createCube } from './chat'
import { createAgentStepsInstructions } from '@metad/core'

export function injectCubeCommand(dimensions: Signal<Property[]>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)

  const createCubeTool = new DynamicStructuredTool({
    name: 'createCube',
    description: 'Create or edit cube',
    schema: CubeSchema,
    func: async (cube) => {
      logger.debug(`Execute copilot action 'createCube':`, cube)
      createCube(modelService, cube as any)
      return translate.instant('PAC.MODEL.Copilot.CreatedCube', { Default: 'Created Cube!' })
    }
  })

  const commandName = 'cube'
  return injectCopilotCommand(commandName, {
    alias: 'c',
    description: 'New or edit a cube',
    agent: {
      type: CopilotAgentType.Default
    },
    tools: [createCubeTool],
    prompt: createAgentPromptTemplate(`You are a cube modeling expert. Let's create a cube!
Generate cube metadata for MDX. The cube name can't be the same as the table name.
Partition the table fields that may belong to the same dimension into the levels of hierarchy of the same dimension.

${createAgentStepsInstructions(
  `根据用户输入信息思考创建 Cube 需要哪些 dimensions 和 measures`,
  `针对每一个 dimension 首先考虑从 shared dimensions 中选择已有的 dimensions 添加至 dimensionUsages 属性中，然后再考虑创建新的 dimensions 至 dimensions 属性中`,
  `针对每一个 measure 首先考虑从表字段中选择合适的 measure 字段添加至 measures 属性中，然后再考虑创建 calculated measures 至 calculatedMembers 属性中`,
  `综合以上结果创建完整的 cube`,
)}

{context}
    
{system_prompt}`),
    systemPrompt: async () => {
      const sharedDimensionsPrompt = JSON.stringify(
        dimensions()
          .filter((dimension) => dimension.hierarchies?.length)
          .map((dimension) => ({
            name: dimension.name,
            caption: dimension.caption,
            table: dimension.hierarchies[0].tables[0]?.name,
            primaryKey: dimension.hierarchies[0].primaryKey
          }))
      )
      return `There is no need to create as dimension with those table fields that are already used in dimensionUsages.
The cube can fill the source field in dimensionUsages only within the name of shared dimensions:
\`\`\`
${sharedDimensionsPrompt}
\`\`\`
`
    }
  })
}
