import { ChatPromptTemplate } from '@langchain/core/prompts'
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

export async function createPlannerAgent(llm: ChatOpenAI) {
  const plannerPrompt = ChatPromptTemplate.fromTemplate(
    `You are a cube modeler, you can use one of the tools: [createDimension, createCube] as every step of the plan. ` +
      `Your final goal is to create a cube model. For the given tables, For a given tables, think about which of them are tables used to create shared dimensions and fact tables used for cubes.` +
      ' For the given objective, come up with a simple step by step plan.' +
      ' This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.' +
      ' The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.\n' +
      `{objective}`
  )

  const model = llm.withStructuredOutput(planFunction)

  const planner = plannerPrompt.pipe(model)

  return planner
}
