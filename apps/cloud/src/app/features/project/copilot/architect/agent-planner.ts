import { Signal } from '@angular/core'
import { HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, FewShotPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { Indicator } from '@metad/cloud/state'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { State, markdownIndicators } from './types'

const plan = zodToJsonSchema(
  z.object({
    steps: z.array(z.string()).describe('different steps to follow, should be in sorted order')
  })
)
const planFunction = {
  name: 'plan',
  description: 'This tool is used to plan the steps to follow',
  parameters: plan
}

const planTool = {
  type: 'function',
  function: planFunction
}

function _createPlannerAgent(llm: ChatOpenAI) {
  const combinedPrompt =
    `As an Indicator System Architect specializing in data analysis, your task is to develop a set of indicators specifically tailored for business data analysis based on model information and user prompt, aligning with your business role.` +
    ` Your goal is to create a detailed plan outlining the necessary steps for the creation of these indicators, with each step corresponding to the development of one indicator and ordered in the sequence required for completion.` +
    `\n{role}\n` +
    `For the given request, come up with a simple step by step plan.` +
    ` This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. ` +
    ` The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.`

  const plannerPrompt = ChatPromptTemplate.fromMessages([
    ['system', combinedPrompt],
    new MessagesPlaceholder('messages')
  ])

  const model = llm.withStructuredOutput(planFunction)

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

  return RunnableLambda.from(async (state: State) => {
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
      console.log(`The plan steps:`, plan.steps)
      return { plan: plan.steps.slice(0, 2) }
    })
}
