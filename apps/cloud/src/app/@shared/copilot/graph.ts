import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableConfig, RunnableLambda } from '@langchain/core/runnables'
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { AgentState, createCopilotAgentState, CreateGraphOptions } from '@metad/copilot'
import { injectKnowledgeRetriever } from '../../@core/copilot/'
import { formatDocumentsAsString } from 'langchain/util/document'

const state: StateGraphArgs<AgentState>['channels'] = createCopilotAgentState()

export function injectCreateChatAgent() {
  const retriever = injectKnowledgeRetriever()
  
  return async ({ llm, secondaryChatModel, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    const prompt = ChatPromptTemplate.fromMessages(
      [
        ['system', '{{role}}\n{{language}}\n{{context}}'],
        ['placeholder', '{messages}']
      ],
      { templateFormat: 'mustache' }
    )

    const callModel = async (state: AgentState, config: RunnableConfig) => {
      const context = await retriever.pipe(formatDocumentsAsString).invoke(state.input, { signal: config.signal })
      // TODO: Auto-promote streaming.
      return {messages: [await prompt.pipe(secondaryChatModel ?? llm).invoke({...state, context }, { signal: config.signal })] }
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
  }
}
