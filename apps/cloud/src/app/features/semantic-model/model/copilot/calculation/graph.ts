import { Signal, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { CreateGraphOptions } from '@metad/copilot'
import { AgentState } from '@metad/copilot-angular'
import {
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  createAgentStepsInstructions,
  injectDimensionMemberTool,
  makeCubePrompt,
  makeCubeRulesPrompt,
  markdownEntityType
} from '@metad/core'
import { CalculatedMember } from '@metad/ocap-core'
import { createCopilotAgentState, createReactAgent } from 'apps/cloud/src/app/@core/copilot'
import { ModelEntityService } from '../../entity/entity.service'
import { SemanticModelService } from '../../model.service'
import { injectCreateCalculatedTool, injectEditFormulaTool } from './tools'

export const CALCULATED_MEASURE_NAME = 'CalculatedMeasure'

const SYSTEM_PROMPT = `You are a cube modeling expert. Let's create a new calculated measure using MDX formula (the Multidimensional Expression) based on the cube structure!
${makeCubeRulesPrompt()}

${createAgentStepsInstructions(
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `根据用户输入的逻辑和获取到的维度成员信息创建一个 MDX 公式。`,
  `考虑此公式的格式化方式：如果是比率或者百分比，需要设置属性 formatting unit 为 %`,
  `最终调用 "createCalcalatedMeasure" 工具来创建一个新的计算度量。`
)}
`

export function injectCreateCalculatedMeasure() {
  const modelService = inject(SemanticModelService)
  const entityService = inject(ModelEntityService)
  const memberRetrieverTool = injectDimensionMemberTool()
  const createCalculatedTool = injectCreateCalculatedTool()

  const entityType = entityService.entityType
  const cube = entityService.cube
  const defaultModel = toSignal(modelService.modelId$)

  const systemContext = async () => {
    let prompt = `The model id is: ${defaultModel()}\n`
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

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      tools: [memberRetrieverTool, createCalculatedTool],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(
          SYSTEM_PROMPT + `\n\n${await systemContext()}\n\n` + `{context}`
        ).format(state as any)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}

export function injectEditFormulaAgent(calculatedMember: Signal<CalculatedMember>) {
  const modelService = inject(SemanticModelService)
  const entityService = inject(ModelEntityService)
  const memberRetrieverTool = injectDimensionMemberTool()
  const editFormulaTool = injectEditFormulaTool(calculatedMember)

  const entityType = entityService.entityType
  const cube = entityService.cube
  const defaultModel = toSignal(modelService.modelId$)

  const systemContext = async () => {
    let prompt = `The model id is: ${defaultModel()}\n`
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
      prompt += `\nThe orignal formula is "${calculatedMember().formula}"`
    }
    return prompt
  }

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()
    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      tools: [memberRetrieverTool, editFormulaTool],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(
          `You are a cube modeling expert. Let's edit the MDX formula (the Multidimensional Expression) based on the cube structure!
${makeCubeRulesPrompt()}

${createAgentStepsInstructions(
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `根据用户输入的 MDX 公式，调用 "editFormula" 工具来编辑公式`
)}
{context}
` + `\n${await systemContext()}\n`
        ).format(state as any)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
