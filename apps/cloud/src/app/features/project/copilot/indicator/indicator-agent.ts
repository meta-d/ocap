import { DynamicStructuredTool } from '@langchain/core/tools'
import { MEMBER_RETRIEVER_TOOL_NAME } from '@metad/core'
import { Route } from '../../../../@core/copilot'
import { markdownBusinessAreas, markdownTags } from '../schema'

export async function createIndicatorWorker(
  { llm, copilotRoleContext, indicatorCodes, businessAreas, tags },
  tools: DynamicStructuredTool[]
) {
  const systemPrompt =
    `You are a business expert in BI indicator system management. Please convert the specified Cube information and requirement description into corresponding parameters and call the createIndicator tool to create a new indicator.` +
    `\n{role}\n` +
    `\n1. code 不能与以下已有的重复：[${indicatorCodes().join(', ')}]` +
    `\n2. Specify a hierarchy name (not the level name) of calendar dimension for this indicator to be used for future calculations of the indicator's trends at different time granularity. If no calendar semantic dimension is found in cube, this question needs to be answered.` +
    `\n3. If the requirement specifies the member condition of the dimension to be limited, then determine which dimension and member description needs to be limited based on the cube dimension information. Call the '${MEMBER_RETRIEVER_TOOL_NAME}' tool to obtain the accurate information of the dimension member and add it to the filters.` +
    `\n4. First, select a suitable measure from the Measures of the Cube as the measure field for defining the basic type of indicator. If the measure field of the basic indicator cannot meet the requirements, consider creating an MDX formula of calculated measure as the formula for the derived indicator. You don't need to multiply by 100 when defining a percentage formula` +
    `\n5. Add dimension names not defined in filters and formula to 'dimensions' field.` +
    `\n6. 如果指标的值是比率或者百分比，需要设置 unit 为 '%'.` +
    `\n7. 从下列 Business Areas 中选择合适的填入 businessAreaId 字段:` +
      markdownBusinessAreas(businessAreas()) +
    `\n8. 从下列 Tags 中选择相关的填入 tags 字段:` +
      markdownTags(tags()) +
    `\n 如果未提供 Cube 信息或者需要重新选择 Cube 时请调用 'pickCube' tool 获取 Cube 信息。` +
    `\n{context}`
  return await Route.createWorkerAgent(llm, tools, systemPrompt, {
    role: copilotRoleContext
  })
}
