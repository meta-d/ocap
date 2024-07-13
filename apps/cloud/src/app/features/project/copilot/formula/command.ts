import { inject } from '@angular/core'
import { SystemMessage } from '@langchain/core/messages'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'
import { StateGraphArgs } from '@langchain/langgraph/web'
import { CopilotAgentType, createCopilotAgentState, CreateGraphOptions, createReactAgent } from '@metad/copilot'
import { AgentState, injectCopilotCommand } from '@metad/copilot-angular'
import { PROMPT_RETRIEVE_DIMENSION_MEMBER, injectDimensionMemberTool, markdownEntityType } from '@metad/core'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { IndicatorRegisterComponent } from '../../indicators/register/register.component'
import { injectModifyFormulaTool } from './tools'

const CreateFormulaSystemPrompt = `You are a business expert in BI indicator system management. You now need to call 'modifyFormula' to create or modify indicator formula using Multidimensional Expressions (MDX) based on user needs.
{role}

1. ${PROMPT_RETRIEVE_DIMENSION_MEMBER}
2. If the indicator value is a ratio or percentage, you need to set unit to '%'.`

export function injectIndicatorFormulaCommand() {
  const translate = inject(TranslateService)
  const fewShotPrompt = injectAgentFewShotTemplate('formula')
  const createGraph = injectCreateFormulaGraph()

  const commandName = 'iformula'
  return injectCopilotCommand(commandName, {
    alias: 'if',
    description: translate.instant('PAC.INDICATOR.Copilot_CommandFormulaDesc', {
      Default: 'Describe the business logic of the indicator formula'
    }),
    agent: {
      type: CopilotAgentType.Graph,
      conversation: true
    },
    fewShotPrompt,
    createGraph
  })
}

export function injectCreateFormulaGraph() {
  const indicatorComponent = inject(IndicatorRegisterComponent)
  const memberRetrieverTool = injectDimensionMemberTool()
  const modifyFormulaTool = injectModifyFormulaTool()

  const systemContext = async () => {
    const indicator = indicatorComponent.indicator()
    const entityType = indicatorComponent.entityType()
    return (
      `Current indicator: ${indicator?.name ?? 'N/A'}\n` +
      `Formula:\n` +
      (indicator?.formula ?? '') +
      `\nformula unit: ${indicator?.unit ?? 'N/A'}` +
      `\n\n` +
      `The formula must be written in Multidimensional Expressions (MDX) language. The formula can reference the following cube:\n\n` +
      markdownEntityType(entityType)
    )
  }

  return async ({ llm, checkpointer }: CreateGraphOptions) => {
    const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()

    return createReactAgent({
      llm,
      checkpointSaver: checkpointer,
      state,
      tools: [memberRetrieverTool, modifyFormulaTool],
      messageModifier: async (state) => {
        const system = await SystemMessagePromptTemplate.fromTemplate(
          CreateFormulaSystemPrompt + `\n\n${await systemContext()}\n\n` + `{context}`
        ).format(state)
        return [new SystemMessage(system), ...state.messages]
      }
    })
  }
}
