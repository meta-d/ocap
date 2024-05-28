import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import {
  CalculationSchema,
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  createAgentStepsInstructions,
  injectDimensionMemberRetrieverTool,
  makeCubePrompt,
  makeCubeRulesPrompt,
  markdownEntityType
} from '@metad/core'
import { createAgentPromptTemplate, injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { C_MEASURES, Cube, EntityType } from '@metad/ocap-core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'

export function injectCalculationCommand(cube: Signal<Cube>, entityType: Signal<EntityType>) {
  const logger = inject(NGXLogger)
  const modelService = inject(SemanticModelService)
  const entityService = inject(ModelEntityService)
  const defaultModel = toSignal(modelService.modelId$)
  const defaultEntity = toSignal(entityService.entityName$)
  const memberRetrieverTool = injectDimensionMemberRetrieverTool(defaultModel, defaultEntity)

  const createFormulaTool = new DynamicStructuredTool({
    name: 'createCalcalatedMeasure',
    description: 'Create or edit calculated measure for cube.',
    schema: CalculationSchema,
    func: async ({ __id__, name, caption, description, formula, formatting }) => {
      const key = __id__ || nanoid()

      logger.debug(`Create a new calculated measure '${name}' with formula '${formula}'`)

      entityService.addCalculatedMeasure({
        name,
        caption,
        // description,
        formula,
        dimension: C_MEASURES,
        visible: true,
        __id__: key
        // formatting
      })

      setTimeout(() => {
        entityService.navigateCalculation(key)
      }, 500)

      return `Calculated measure created!`
    }
  })

  const commandName = 'calculation'
  return injectCopilotCommand(commandName, {
    alias: 'calc',
    description: 'Create a new calculated measure',
    agent: {
      type: CopilotAgentType.Default
    },
    tools: [memberRetrieverTool, createFormulaTool],
    fewShotPrompt: injectAgentFewShotTemplate(commandName),
    prompt:
      createAgentPromptTemplate(`You are a cube modeling expert. Let's create a new calculated measure using MDX formula (the Multidimensional Expression) based on the cube structure!
${makeCubeRulesPrompt()}

${createAgentStepsInstructions(
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `根据用户输入的逻辑，调用 "createCalcalatedMeasure" 工具来创建一个新的计算度量。`
)}

{context}
    
{system_prompt}`),
    systemPrompt: async () => {
      let prompt = ''
      if (entityType()) {
        prompt += `The cube structure is: 
\`\`\`
${markdownEntityType(entityType())}
\`\`\`
`
      } else {
        prompt += `The cube structure is:
\`\`\`
${makeCubePrompt(cube())}
\`\`\`
    `
      }

      return prompt
    }
  })
}
