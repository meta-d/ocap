import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { Runnable, RunnableLambda } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { AgentState } from '@metad/copilot-angular'
import { JsonOutputToolsParser } from 'langchain/output_parsers'

export interface State extends AgentState {
  next: string
  instructions: string
  reasoning: string
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
    },
    reasoning: {
      value: (x: string, y?: string) => y ?? x,
      default: () => ''
    }
  }
}


export const getInstructions = RunnableLambda.from((state: State) => {
  return {
    messages: [new HumanMessage(state.instructions)],
    role: state.role,
    context: state.context
  }
})

export const getMessages = RunnableLambda.from((state: State) => {
  return { messages: state.messages }
})

export const joinGraph = RunnableLambda.from((response: AgentState) => {
  return {
    messages: [response.messages[response.messages.length - 1]]
  }
})

export const SupervisorSystemPrompt = 'You are a supervisor tasked with managing a conversation between the' +
    ' following workers:  {team_members}. Given the following user request,' +
    ' respond with the worker to act next. Each worker will perform a' +
    ' task and respond with their results and status. When finished,' +
    ' respond with FINISH.\n\n' +
    ' Select strategically to minimize the number of steps taken.'

export async function createSupervisor(llm: ChatOpenAI, members: string[], systemPrompt?: string): Promise<Runnable> {
  const options = ['FINISH', ...members]
  const functionDef = {
    name: 'route',
    description: 'Select the next role.',
    parameters: {
      title: 'routeSchema',
      type: 'object',
      properties: {
        reasoning: {
          title: 'Reasoning',
          type: 'string'
        },
        next: {
          title: 'Next',
          anyOf: [{ enum: options }]
        },
        instructions: {
          title: 'Instructions',
          type: 'string',
          description: 'The specific instructions of the sub-task the next role should accomplish.'
        }
      },
      required: ['reasoning', 'next', 'instructions']
    }
  }
  const toolDef = {
    type: 'function' as const,
    function: functionDef
  }
  let prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt ?? SupervisorSystemPrompt],
    new MessagesPlaceholder('messages'),
    ['system', 'Given the conversation above, who should act next? Or should we FINISH? Select one of: {options}']
  ])
  prompt = await prompt.partial({
    options: options.join(', '),
    team_members: members.join(', ')
  })

  const supervisor = prompt
    .pipe(
      llm.bind({
        tools: [toolDef],
        tool_choice: { type: 'function', function: { name: 'route' } }
      })
    )
    .pipe(new JsonOutputToolsParser())
    // select the first one
    .pipe((x) => x[0].args)

  return supervisor
}
