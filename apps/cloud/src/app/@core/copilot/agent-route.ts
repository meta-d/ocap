import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { RunnableConfig } from '@langchain/core/runnables'
import { StructuredToolInterface } from '@langchain/core/tools'
import { PartialValues } from '@langchain/core/utils/types'
import { ChatOpenAI } from '@langchain/openai'
import { AgentState } from '@metad/copilot-angular'
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'
import { z } from 'zod'

type ZodAny = z.ZodObject<any, any, any, any>

export interface State extends AgentState {
  next: string
  instructions?: string
}

export function createState() {
  return {
    input: {
      value: (x: any, y: any) => y ?? x,
      default: () => ''
    },
    role: {
      value: (x: any, y: any) => y ?? x,
      default: () => ''
    },
    context: {
      value: (x: any, y: any) => y ?? x,
      default: () => ''
    },
    messages: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => []
    },
    next: {
      value: (x: string, y?: string) => y ?? x,
      default: () => ''
    },
    instructions: {
      value: (x: string, y?: string) => y ?? x,
      default: () => "Resolve the user's request."
    }
  }
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
