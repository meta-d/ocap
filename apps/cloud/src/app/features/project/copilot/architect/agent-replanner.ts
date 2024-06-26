import { AIMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { Plan } from 'apps/cloud/src/app/@core/copilot'
import { JsonOutputToolsParser } from 'langchain/output_parsers'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { IndicatorArchitectState } from './types'

const response = zodToJsonSchema(
  z.object({
    response: z.string().describe('Response to user.')
  })
)

function _createReplannerAgent(llm: ChatOpenAI) {
  const responseTool = {
    type: 'function',
    function: {
      name: 'response',
      description: 'Response to user.',
      parameters: response
    }
  }

  const replannerPrompt = ChatPromptTemplate.fromTemplate(
    `As an Indicator System Architect specializing in data analysis, for the given objective, come up with a simple step by step plan. 
This plan should involve individual tasks for creating indicator, that if executed correctly will yield the correct answer. Do not add any superfluous steps. Make sure that each step has all the information needed - do not skip steps.` +
      `\n{role}\n` +
      `Your objective was this:
{input}

Your original plan was this:
{plan}

You have currently done the follow steps:
{pastSteps}

Update your plan accordingly. Don't add more steps than originally planned and only the steps to create an indicator can be planned. No need to add review steps.` +
` Fill out the plan. Only add steps to the plan that still NEED to be done. Do not return previously done steps as part of the plan.` +
` If no more steps are needed or you can return to the user, then respond use the 'response' function.`
  )

  const parser = new JsonOutputToolsParser()
  const replanner = replannerPrompt.pipe(llm.bindTools([Plan.planTool, responseTool])).pipe(parser)
  return replanner
}

export async function createReplannerAgent({ llm }: { llm: ChatOpenAI }) {
  const agent = _createReplannerAgent(llm)

  return RunnableLambda.from((state: IndicatorArchitectState) => {
    return {
      ...state,
      plan: state.plan.join('\n'),
      pastSteps: state.pastSteps.map(([step, result]) => `step: task:${step}; result:${result}`).join('\n') +
        (state.plan.length ? '' : `\nAll the steps in the original plan have been completed, you can response to the user`)
    }
  })
    .pipe(agent as any)
    .pipe((output) => {
      const toolCall = output[0]

      if (toolCall.type == 'response') {
        return {
          response: toolCall.args?.response,
          messages: [new AIMessage(toolCall.args?.response)]
        }
      }

      const steps = toolCall.args?.steps
      return {
        plan: toolCall.args?.steps,
        messages: [
          new AIMessage(`The new plan is: \n${steps.map((step, index) => '  - ' + step).join('\n')}`)
        ]
      }
    })
}
