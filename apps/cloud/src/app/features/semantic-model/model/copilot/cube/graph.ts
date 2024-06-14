import { ChatOpenAI } from '@langchain/openai'
import { createCommandAgent } from '../langgraph-helper-utilities'
import { injectCreateCubeTool } from './tools'

export const CubeModelerName = 'CubeModeler'

export function injectCubeModeler() {
  const createCubeTool = injectCreateCubeTool()

  return async (llm: ChatOpenAI) => {
    const agent = await createCommandAgent(
      llm,
      [createCubeTool],
      'You are a cube modeling assistant who can model a cube for data analysis.'
    )
    return agent
  }
}
