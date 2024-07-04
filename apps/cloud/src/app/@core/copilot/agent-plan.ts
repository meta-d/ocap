import { BaseMessage } from '@langchain/core/messages'
import { AgentState } from '@metad/copilot-angular'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

export interface State extends AgentState {
  plan: string[]
  pastSteps: [string, string][]
  response?: string
}

const plan = zodToJsonSchema(
  z.object({
    steps: z.array(z.string()).describe('different steps to follow, should be in sorted order')
  })
)
export const planFunction = {
  name: 'plan',
  description: 'This tool is used to plan the steps to follow',
  parameters: plan
}

export const planTool = {
  type: 'function',
  function: planFunction
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
    plan: {
      value: (x?: string[], y?: string[]) => y ?? x ?? [],
      default: () => []
    },
    pastSteps: {
      value: (x: [string, string][], y: [string, string][]) => x.concat(y),
      default: () => []
    },
    response: {
      value: (x?: string, y?: string) => y ?? x,
      default: () => undefined
    }
  }
}
