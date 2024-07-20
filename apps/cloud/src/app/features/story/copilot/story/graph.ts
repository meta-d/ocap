import { inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BaseMessage, HumanMessage, isAIMessage, ToolMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import { END, START, StateGraph } from '@langchain/langgraph/web'
import { ChatOpenAI } from '@langchain/openai'
import { AgentState, CreateGraphOptions, Team } from '@metad/copilot'
import { DataSettings } from '@metad/ocap-core'
import { injectCreateWidgetAgent } from '@metad/story/story'
import { NGXLogger } from 'ngx-logger'
import { CalculationAgentState, injectCreateCalculationGraph } from '../calculation'
import { StoryAgentState, storyAgentState } from './types'

export function injectCreateStoryGraph() {
  // Default
  const defaultDataSettings = signal<DataSettings & { modelId: string }>(null)
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const logger = inject(NGXLogger)

  const createCalculationGraph = injectCreateCalculationGraph(
    defaultDataSettings,
    (dataSettings: DataSettings, key: string) => {
      logger.debug(
        `Created calculation '${key}' for dataSource '${dataSettings.dataSource}' entity '${dataSettings.entitySet}'`
      )
      router.navigate(['calculations', encodeURIComponent(dataSettings.entitySet), key], { relativeTo: route })
    }
  )

  const createWidgetGraph = injectCreateWidgetAgent()

  return async ({ llm, checkpointer, interruptBefore, interruptAfter }: CreateGraphOptions) => {
    

    const calculationAgent = (await createCalculationGraph({ llm })).compile()

    const shouldContinue = (state: AgentState) => {
      const { messages } = state
      const lastMessage = messages[messages.length - 1]
      if (isAIMessage(lastMessage)) {
        if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
          return END
        } else {
          return lastMessage.tool_calls[0].args.next
        }
      } else {
        return END
      }
    }

    const superAgent = await Team.createSupervisorAgent(
      llm,
      [
        {
          name: 'calcualtion',
          description: 'create a calculation measure for cube'
        },
        {
          name: 'widget',
          description: 'create a widget in story dashboard'
        }
      ],
      [],
      `你是一名数据分析师。
{role}
{language}
{context}

Story dashbaord 通常由多个页面组成，每个页面是一个分析主题，每个主题的页面通常由一个过滤器栏、多个主要的维度输入控制器、多个指标、多个图形、一个或多个表格组成。
`
    )

    const widgetAgent = await createWidgetGraph({llm})

    const superGraph = new StateGraph({ channels: storyAgentState })
      // Add steps nodes
      .addNode(
        Team.SUPERVISOR_NAME,
        new RunnableLambda({ func: superAgent }).withConfig({ runName: Team.SUPERVISOR_NAME })
      )
      .addNode(
        'calculation',
        RunnableLambda.from(async (state: StoryAgentState) => {
          // const content = await fewShotPrompt.format({ input: state.input, context: state.context })
          return {
            input: state.input,
            messages: [new HumanMessage(state.instructions)],
            role: state.role,
            context: state.context,
            tool_call_id: state.tool_call_id
          }
        })
          .pipe(calculationAgent)
          .pipe((response: CalculationAgentState) => {
            return {
              tool_call_id: null,
              messages: [
                new ToolMessage({
                  tool_call_id: response.tool_call_id,
                  content: response.messages[response.messages.length - 1].content
                })
              ]
            }
          })
      )
      .addNode(
        'widget',
        RunnableLambda.from(async (state: StoryAgentState) => {
          const { messages } = await widgetAgent.invoke({
            input: state.input,
            messages: [new HumanMessage(state.instructions)],
            role: state.role,
            context: state.context,
          })

          return {
            tool_call_id: null,
            messages: [
              new ToolMessage({
                tool_call_id: state.tool_call_id,
                content: messages[messages.length - 1].content
              })
            ]
          }
        })
      )
      .addEdge('calculation', Team.SUPERVISOR_NAME)
      .addEdge('widget', Team.SUPERVISOR_NAME)
      .addConditionalEdges(Team.SUPERVISOR_NAME, shouldContinue, {
        calculation: 'calculation',
        widget: 'widget',
        [END]: END
      })
      .addEdge(START, Team.SUPERVISOR_NAME)

    return superGraph
  }
}



// async function createStorySupervisorAgent(llm: ChatOpenAI, system: string) {
//   const members = ['calculation']
//   const functionDef = Team.createRouteFunctionDef(members)
//   const toolDef = {
//     type: 'function' as const,
//     function: functionDef
//   }

//   const modelWithTools = llm.bindTools([toolDef])
//   let prompt = ChatPromptTemplate.fromMessages([
//     ['system', system],
//     ['placeholder', '{messages}'],
//     ['system', `Given the conversation above, please give priority to answering questions with language only. If you need to execute a task, you need to get confirmation before calling the route function.
// To perform a task, you can select one of the following: {members}`]
//   ])
//   prompt = await prompt.partial({
//     members: members.join(', ')
//   })
//   const modelRunnable = prompt.pipe(modelWithTools)

//   const callModel = async (state: AgentState) => {
//     // TODO: Auto-promote streaming.
//     const message = await modelRunnable.invoke(state)

//     const newState = {
//       messages: [message as BaseMessage]
//     } as StoryAgentState

//     if (isAIMessage(message) && message.tool_calls && message.tool_calls[0]?.name === 'route') {
//       newState.tool_call_id = message.tool_calls[0].id
//       newState.next = message.tool_calls[0].args.next
//       newState.reasoning = message.tool_calls[0].args.reasoning
//       newState.instructions = message.tool_calls[0].args.instructions
//     }

//     return newState
//   }

//   return callModel
// }
