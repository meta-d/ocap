import { Signal } from '@angular/core'
import { AIMessage, BaseMessage, isAIMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { DynamicStructuredTool, StructuredTool } from '@langchain/core/tools'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { CompiledStateGraph, END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { PropertyDimension } from '@metad/ocap-core'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { IPlanState } from './types'

const plan = zodToJsonSchema(
  z.object({
    steps: z.array(z.string()).describe('different steps to follow, should be in sorted order')
  })
)

export async function createModelerPlanner({
  llm,
  selectTablesTool,
  dimensions
}: {
  llm: ChatOpenAI
  selectTablesTool: DynamicStructuredTool
  dimensions: Signal<PropertyDimension[]>
}) {
  const tools = [selectTablesTool as any]

  const plannerPrompt = await ChatPromptTemplate.fromMessages([
    ['system', `You are a cube modeler for data analysis, now you need create a plan for the final goal.` +
      ` For the given tables if use provided, think about which of them are tables used to create shared dimensions and fact tables used for cubes.` +
      ` Or use the 'selectTables' tool to get all tables then select the required physical tables from them.` +
      ` If the dimension required for modeling is in the following existing shared dimensions, please do not put it in the plan, just use it directly in the cube creation task` +
      ` Each step of the plan corresponds to one of the tasks 'Create a shared dimension' and 'Create a cube'. ` +
      ' This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.' +
      ' The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.\n\n' +
      `Objective is: {objective}`],
    ['user', `Existing shared dimensions: \n{dimensions}\n`]
  ]).partial({
    dimensions: () =>
      dimensions()
        .map((d) => `- name: ${d.name}\n  caption: ${d.caption || ''}`)
        .join('\n')
  })

  return createPlannerReactAgent({ llm, tools, systemMessage: plannerPrompt })
}

export function createPlannerReactAgent(props: {
  llm: ChatOpenAI
  tools: StructuredTool[]
  systemMessage: ChatPromptTemplate
}): CompiledStateGraph<IPlanState, Partial<IPlanState>, typeof START | 'agent' | 'tools'> {
  const { llm, tools, systemMessage } = props

  const schema: StateGraphArgs<IPlanState>['channels'] = {
    messages: {
      value: (left: BaseMessage[], right: BaseMessage[]) => left.concat(right),
      default: () => []
    },
    objective: {
      value: (left: string, right: string) => right ?? left ?? '',
      default: () => ''
    }
  }

  const endict = new RunnableLambda({
    func: ({ objective, messages }: IPlanState) => ({ objective, messages })
  })

  const prompt = ChatPromptTemplate.fromMessages([systemMessage, ['placeholder', '{messages}']])

  const boundModel = endict.pipe(prompt).pipe(
    llm.bindTools([
      ...tools,
      {
        type: 'function',
        function: {
          name: 'Response',
          description: 'Respond the plan steps to the user using this tool.',
          parameters: plan
        }
      }
    ])
  )

  const toolNode = new ToolNode<{ messages: BaseMessage[] }>(tools as any[])

  // Define the function that determines whether to continue or not
  const route = (state: IPlanState) => {
    const { messages } = state
    const lastMessage = messages[messages.length - 1] as AIMessage
    // If there is no function call, then we finish
    if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
      return END
    }
    // Otherwise if there is, we need to check what type of function call it is
    if (lastMessage.tool_calls[0].name === 'Response') {
      return END
    }
    // Otherwise we continue
    return 'tools'
  }

  // Define the function that calls the model
  const callModel = async (state: IPlanState, config?: any) => {
    const response = await boundModel.invoke(state)
    // We return an object, because this will get added to the existing list
    return { messages: [response] }
  }

  // Define a new graph
  const workflow = new StateGraph<IPlanState>({
    channels: schema
  })
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge(START, 'agent')
    .addConditionalEdges(
      // First, we define the start node. We use `agent`.
      // This means these are the edges taken after the `agent` node is called.
      'agent',
      // Next, we pass in the function that will determine which node is called next.
      route
    )
    // We now add a normal edge from `tools` to `agent`.
    // This means that after `tools` is called, `agent` node is called next.
    .addEdge('tools', 'agent')

  // Finally, we compile it!
  // This compiles it into a LangChain Runnable,
  // meaning you can use it as you would any other runnable
  const app = workflow.compile()

  return app
}

export function getPlanFromState(state: IPlanState) {
  const lastMessage = state.messages[state.messages.length - 1]
  if (isAIMessage(lastMessage)) {
    return lastMessage.tool_calls[0].args.steps
  }

  throw new Error('No plan found in last message.')
}

// export async function createPlannerAgent({
//   llm,
//   selectTablesTool
// }: {
//   llm: ChatOpenAI
//   selectTablesTool: DynamicStructuredTool
// }) {
//   const tools = [selectTablesTool as any]

//   return createReactAgent({
//     llm: llm as any,
//     tools,
//     systemMessage: new SystemMessage(
//       )
//   })
// }

// export function createReactAgent({ llm, tools, systemMessage }) {
//   const schema: StateGraphArgs<IGraphState>['channels'] = {
//     messages: {
//       value: (left: BaseMessage[], right: BaseMessage[]) => left.concat(right),
//       default: () => []
//     }
//   }

//   const modelWithTools = llm.bindTools(tools)

//   const modelRunnable = _createModelWrapper(modelWithTools, {
//     systemMessage
//   })

//   const shouldContinue = (state: IGraphState) => {
//     const { messages } = state
//     const lastMessage = messages[messages.length - 1]
//     if (isAIMessage(lastMessage) && (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0)) {
//       return END
//     } else {
//       return 'continue'
//     }
//   }

//   const callModel = async (state: IGraphState) => {
//     const { messages } = state
//     // TODO: Auto-promote streaming.
//     return { messages: [await modelRunnable.invoke(messages)] }
//   }

//   const workflow = new StateGraph<IGraphState>({
//     channels: schema
//   })
//     .addNode('agent', new RunnableLambda({ func: callModel }).withConfig({ runName: 'agent' }) as any)
//     .addNode('tools', new ToolNode<IGraphState>(tools).pipe((state) => state))
//     .addEdge(START, 'agent')
//     .addConditionalEdges('agent', shouldContinue, {
//       continue: 'tools',
//       [END]: END
//     })
//     .addEdge('tools', 'agent')

//   return workflow.compile({})
// }

// function _createModelWrapper(
//   modelWithTools: RunnableInterface<BaseLanguageModelInput, BaseMessageChunk, BaseLanguageModelCallOptions>,
//   { systemMessage }
// ) {
//   const endict = new RunnableLambda({
//     func: (messages: BaseMessage[]) => ({ messages })
//   })

//   const prompt = ChatPromptTemplate.fromMessages([systemMessage, ['placeholder', '{messages}']])

//   return endict.pipe(prompt).pipe(modelWithTools)
// }
