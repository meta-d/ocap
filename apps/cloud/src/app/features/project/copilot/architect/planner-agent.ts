import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

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

export function createPlannerAgent(llm: ChatOpenAI, system?: string) {
    const combinedPrompt = (system ? system + ' ' : '') +
        `\n{role}\n` +
        `For the given request, come up with a simple step by step plan.` +
      ` This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. ` +
      ` The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.`

    const plannerPrompt = ChatPromptTemplate.fromMessages([
        ["system", combinedPrompt],
        new MessagesPlaceholder("messages"),
    ])

  const model = llm.withStructuredOutput(planFunction)

  const planner = plannerPrompt.pipe(model)

  return planner
}
