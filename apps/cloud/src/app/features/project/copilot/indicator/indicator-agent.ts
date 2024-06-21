import { DynamicStructuredTool } from '@langchain/core/tools'
import { MEMBER_RETRIEVER_TOOL_NAME } from '@metad/core'
import { Route } from '../../../../@core/copilot'

export async function createIndicatorWorker(
  { llm, copilotRoleContext, indicatorCodes },
  tools: DynamicStructuredTool[]
) {
  const systemPrompt =
    `You are a business expert in BI indicator system management. Please convert the specified Cube information and requirement description into corresponding parameters and call the createIndicator tool to create a new indicator.` +
    `\n{role}\n` +
    `\n1. code 不能与以下已有的重复：[${indicatorCodes().join(', ')}]` +
    `\n2. Specify a hierarchy name (not the level name) of calendar dimension for this indicator to be used for future calculations of the indicator's trends at different time granularity. If no calendar semantic dimension is found in cube, this question needs to be answered.` +
    `\n3. 如果需求中指定了需要限定维度的成员条件，那么根据cube 维度信息确定是需要限定哪个维度和成员的描述调用 '${MEMBER_RETRIEVER_TOOL_NAME}' tool 获取维度成员的准确信息后加入到 filters 限定条件中。` +
    `\n4. 将未限定成员的可以自由选择的维度都加入到 dimensions 中.` +
    `\n5. 如果指标的值是比率或者百分比，需要设置 unit 为 '%'.` +
    `\n 如果未提供 Cube 信息或者需要重新选择 Cube 时请调用 'pickCube' tool 获取 Cube 信息。` +
    `\n{context}`
  return await Route.createWorkerAgent(llm, tools, systemPrompt, {
    role: copilotRoleContext
  })
}
