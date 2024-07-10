import { DynamicStructuredTool } from '@langchain/core/tools'
import { makeCubeRulesPrompt, MEMBER_RETRIEVER_TOOL_NAME } from '@metad/core'
import { Route } from '../../../../@core/copilot'
import { markdownBusinessAreas, markdownTags } from '../schema'

export async function createIndicatorWorker(
  { llm, indicatorCodes, businessAreas, tags },
  tools: DynamicStructuredTool[]
) {
  const systemPrompt =
    `You are a business expert in BI indicator system management. Please convert the specified Cube information and requirement description into corresponding parameters and call the createIndicator tool to create a new indicator.` +
    `\n{role}\n` +
    `\n${makeCubeRulesPrompt()}` +
    `\n1. Code cannot be the same as the following existing ones: [${indicatorCodes().join(', ')}]` +
    `\n2. Specify a hierarchy name (not the level name) of calendar dimension for this indicator to be used for future calculations of the indicator's trends at different time granularity. If no calendar semantic dimension is found in cube, this question needs to be answered.` +
    `\n3. If the requirement specifies the member condition of the dimension to be limited, then determine which dimension and member description needs to be limited based on the cube dimension information. Call the '${MEMBER_RETRIEVER_TOOL_NAME}' tool to obtain the accurate information of the dimension member and add it to the filters.` +
    `\n4. First, select a suitable measure from the Measures of the Cube as the measure field for defining the basic type of indicator. If the measure field of the basic indicator cannot meet the requirements, consider creating an MDX formula of calculated measure as the formula for the derived indicator. You don't need to multiply by 100 when defining a percentage formula` +
    `\n5. Set all dimensions (not hierarchy) not used in filters or formula or calendar to the 'dimensions' field.` +
    `\n6. If the indicator value is a ratio or percentage, you need to set unit to '%'.` +
    `\n7. Select the appropriate Business Areas from the following to fill in the businessAreaId field:` +
      markdownBusinessAreas(businessAreas()) +
    `\n8. Select the relevant tags from the following and fill in the tags field:` +
      markdownTags(tags()) +
    `\n If no Cube information is provided or you need to reselect a Cube, please call the 'pickCube' tool to get the Cube information.` +
    `\n{context}` + 
    `\nCurrent indicator info is:` + 
    `\n{indicator}`
  return await Route.createWorkerAgent(llm, tools, systemPrompt)
}
