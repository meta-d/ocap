import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableConfig, RunnableLambda } from '@langchain/core/runnables'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { AgentState, createCopilotAgentState, CreateGraphOptions } from '@metad/copilot'
import { z } from 'zod'

const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()

const dummyTool = new DynamicStructuredTool({
  name: 'dummy',
  description: `This dummy tool do't use`,
  schema: z.object({}),
  func: async () => {
    return ``
  }
})

export function injectCreateChatAgent() {
  return async ({ llm, secondaryChatModel, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const prompt = ChatPromptTemplate.fromMessages(
      [
        ['system', '{{role}}\n{{language}}\n{{context}}'],
        ['placeholder', '{messages}']
      ],
      { templateFormat: 'mustache' }
    )

    const callModel = async (state: AgentState, config: RunnableConfig) => {
      console.log(`call Model in free graph:`, state.messages)
      // TODO: Auto-promote streaming.
      return { messages: [await prompt.pipe(secondaryChatModel ?? llm).invoke(state, { signal: config.signal })] }
    }
    const workflow = new StateGraph<AgentState>({
      channels: state
    })
      .addNode('agent', new RunnableLambda({ func: callModel }).withConfig({ runName: 'agent' }))
      .addEdge('agent', END)
      .addEdge(START, 'agent')

    return workflow.compile({
      checkpointer,
      interruptBefore,
      interruptAfter
    })

    // return createReactAgent({
    //   state: superState,
    //   llm,
    //   tools: [],
    //   checkpointSaver: checkpointer,
    //   interruptBefore,
    //   interruptAfter,
    //   messageModifier: async (state) => {
    //     return [new SystemMessage(`${state.role}\n${state.context}`), ...state.messages]
    //   }
    // })
  }
}
