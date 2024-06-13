import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import {
  FormulaSchema,
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  createAgentStepsInstructions,
  injectDimensionMemberRetrieverTool,
  makeCubePrompt,
  makeCubeRulesPrompt,
  markdownEntityType
} from '@metad/core'
import { NgmCopilotService, createAgentPromptTemplate, injectCopilotCommand } from '@metad/copilot-angular'
import { CalculatedMember, Cube, EntityType } from '@metad/ocap-core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { ModelEntityService } from '../../entity/entity.service'
import { SemanticModelService } from '../../model.service'
import { ModelDesignerType } from '../../types'

export function injectFormulaCommand(
  calculatedMember: Signal<CalculatedMember>,
  cube: Signal<Cube>,
  entityType: Signal<EntityType>
) {
  const logger = inject(NGXLogger)
  const modelService = inject(SemanticModelService)
  const entityService = inject(ModelEntityService)
  const copilotService = inject(NgmCopilotService)

  const defaultModel = toSignal(modelService.modelId$)
  const defaultEntity = toSignal(entityService.entityName$)
  const memberRetrieverTool = injectDimensionMemberRetrieverTool(defaultModel, defaultEntity)

  const createFormulaTool = new DynamicStructuredTool({
    name: 'editFormula',
    description: 'Create or edit mdx formula',
    schema: z.object({ formula: FormulaSchema }),
    func: async ({ formula }) => {
      logger.debug(`New formula '${formula}'`)

      entityService.updateCubeProperty({
        type: ModelDesignerType.calculatedMember,
        id: calculatedMember().__id__,
        model: {
          formula
        }
      })

      return `Formula updated!`
    }
  })

  const commandName = 'formula'
  return injectCopilotCommand(commandName, {
    alias: 'f',
    description: 'Create or edit a mdx formula',
    agent: {
      type: CopilotAgentType.Default
    },
    tools: [memberRetrieverTool, createFormulaTool],
    fewShotPrompt: injectAgentFewShotTemplate(commandName),
    prompt:
      createAgentPromptTemplate(`You are a cube modeling expert. Let's edit the MDX formula (the Multidimensional Expression) based on the cube structure!
${makeCubeRulesPrompt()}

${createAgentStepsInstructions(
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `根据用户输入的 MDX 公式，调用 "editFormula" 工具来编辑公式`
)}

{context}
    
{system_prompt}`),
    systemPrompt: async () => {
      let prompt = `${copilotService.rolePrompt()}`
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

      if (calculatedMember()) {
        prompt += `The orignal formula is "${calculatedMember().formula}"`
      }

      return prompt
    }
  })
}
