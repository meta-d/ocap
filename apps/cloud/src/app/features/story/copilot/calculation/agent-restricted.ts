import { DynamicStructuredTool } from '@langchain/core/tools'
import { ChatOpenAI } from '@langchain/openai'
import { makeCubeRulesPrompt } from '@metad/core'
import { Route } from 'apps/cloud/src/app/@core/copilot'
import { MEMBER_RETRIEVER_PROMPT } from './types'

export async function createRestrictedMeasureWorker({
  llm,
  tools
}: {
  llm: ChatOpenAI
  tools: DynamicStructuredTool[]
}) {
  const systemPrompt =
    `You are a data analyst. Please create a measure that aggregate values based on restrictions imposed by dimension members.` +
    ` It is useful when you need to filter or limit the data aggregation to specific members of a dimension.` +
    MEMBER_RETRIEVER_PROMPT +
    ` The name of new calculation measure should be unique with existing measures.` +
    ` Use the dimensions, hierarchy, level and other names accurately according to the cube information provided.` +
    makeCubeRulesPrompt() +
    `\nTry to perform derivative calculations based on existing measures.` +
    `\n\n{role}` +
    `\n\n{context}`

  return await Route.createWorkerAgent(llm, tools, systemPrompt)
}
