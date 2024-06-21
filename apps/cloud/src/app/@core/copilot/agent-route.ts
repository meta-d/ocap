import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { Runnable, RunnableConfig } from '@langchain/core/runnables'
import { StructuredToolInterface } from '@langchain/core/tools'
import { PartialValues } from '@langchain/core/utils/types'
import { END } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'
import { JsonOutputToolsParser } from 'langchain/output_parsers'
import { z } from 'zod'
import { ConversationState } from './types'

type ZodAny = z.ZodObject<any, any, any, any>

export interface State extends ConversationState {
  next: string
}

/**
 * Create the **supervisor** node for the route graph.
 * The supervisor will manage the conversation between the **workers**.
 * 
 * @param llm 
 * @param members 
 * @returns 
 */
export async function createSupervisor(llm: ChatOpenAI, members: string[], system?: string): Promise<Runnable> {
  const systemPrompt =
    'You are a supervisor tasked with managing a conversation between the' +
    ' following workers: {members}. Given the following user request,' +
    ' respond with the worker to act next. Each worker will perform a' +
    ' task and respond with their results and status. When finished,' +
    ' respond with END.' + (system ? ' ' + system : '')
  const options = [END, ...members]

  // Define the routing function
  const functionDef = {
    name: 'route',
    description: 'Select the next role.',
    parameters: {
      title: 'routeSchema',
      type: 'object',
      properties: {
        next: {
          title: 'Next',
          anyOf: [{ enum: options }]
        }
      },
      required: ['next']
    }
  }

  const toolDef = {
    type: 'function',
    function: functionDef
  } as const

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('messages'),
    ['system', 'Given the conversation above, who should act next?' + ' Or should we FINISH? Select one of: {options}']
  ])

  const formattedPrompt = await prompt.partial({
    options: options.join(', '),
    members: members.join(', ')
  })

  const supervisorChain = formattedPrompt
    .pipe(
      llm.bindTools([toolDef], {
        tool_choice: { type: 'function', function: { name: 'route' } }
      })
    )
    .pipe(new JsonOutputToolsParser())
    // select the first one
    .pipe((x) => x[0].args)

  return supervisorChain
}

/**
 * Create agent executor for **worker** node in the route graph.
 * The worker will execute the task given by the supervisor then return the result back to the supervisor.
 * 
 * @param llm 
 * @param tools 
 * @param systemPrompt 
 * @returns 
 */
export async function createWorkerAgent<NewPartialVariableName extends string>(
  llm: ChatOpenAI,
  tools: StructuredToolInterface<ZodAny>[],
  systemPrompt: string,
  partialValues?: PartialValues<NewPartialVariableName>
): Promise<AgentExecutor> {
  // Each worker node will be given a name and some tools.
  const _prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('messages'),
    new MessagesPlaceholder('agent_scratchpad')
  ])
  let prompt = _prompt
  if (partialValues) {
    prompt = await _prompt.partial(partialValues)
  }

  const agent = await createOpenAIToolsAgent({ llm, tools, prompt })
  return new AgentExecutor({ agent, tools })
}

/**
 * Create a function for run the **worker** agent in graph.
 * 
 * @param agent 
 * @param name 
 * @returns 
 */
export function createRunWorkerAgent<S>(agent: AgentExecutor, name: string) {
  return async function runWorkerAgent(state: S, config?: RunnableConfig) {
    const result = await agent.invoke(state, config)
    return {
      messages: [new HumanMessage({ content: result.output, name })]
    }
  }
}
