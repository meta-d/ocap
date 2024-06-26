import { Signal } from '@angular/core'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, FewShotPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { Indicator } from '@metad/cloud/state'
import { IndicatorArchitectState, markdownIndicators } from './types'
import { Plan } from 'apps/cloud/src/app/@core/copilot'


function _createPlannerAgent(llm: ChatOpenAI) {
  const combinedPrompt =
    `As an Indicator System Architect specializing in data analysis, your task is to develop a set of indicators specifically tailored for business data analysis based on cube information and user prompt, aligning with your business role.` +
    ` Your goal is to create a detailed plan outlining the necessary steps for the creation of these indicators, with each step corresponding to the development of one indicator and ordered in the sequence required for completion.` +
    `\n{role}\n` +
    `\n{context}\n` +
    `For the given request, come up with a simple step by step plan.` +
    ` This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. ` +
    ` The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.`

  const plannerPrompt = ChatPromptTemplate.fromMessages([
    ['system', combinedPrompt],
    new MessagesPlaceholder('messages')
  ])

  const model = llm.withStructuredOutput(Plan.planFunction)

  const planner = plannerPrompt.pipe(model)

  return planner
}

export async function createPlannerAgent({
  llm,
  fewShotTemplate,
  indicators
}: {
  llm: ChatOpenAI
  fewShotTemplate: FewShotPromptTemplate
  indicators: Signal<Indicator[]>
}) {
  const agent = _createPlannerAgent(llm)

  return RunnableLambda.from(async (state: IndicatorArchitectState) => {
    // Call fewshot examples prompt
    const userInput = state.messages.map((x) => x.content).join('\n')
    const content = await fewShotTemplate.format({ input: userInput, context: state.context })
    return {
      ...state,
      messages: [
        new HumanMessage(
          `Existing indicators do not need to be created again. Exisiting indicators:\n` +
            markdownIndicators(indicators())
        ),
        new HumanMessage(content)
      ]
    }
  })
    .pipe(agent)
    .pipe((plan) => {
      return {
        plan: plan.steps,
        messages: [new AIMessage(`The plan is: \n${plan.steps.map((step, index) => `  - ` + step).join('\n')}`)]
      }
    })
}
