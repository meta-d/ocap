import { DynamicStructuredTool } from '@langchain/core/tools'
import { CubeVariablePrompt, makeCubeRulesPrompt, MEMBER_RETRIEVER_TOOL_NAME } from '@metad/core'
import { Route } from '../../../../@core/copilot'
import { markdownBusinessAreas, markdownTags } from '../schema'
import { promptIndicatorCode } from '../prompt'

export async function createIndicatorWorker(
  { llm, indicatorCodes, businessAreas, tags },
  tools: DynamicStructuredTool[]
) {
  const systemPrompt =
    `You are a business expert in BI indicator system management. Please convert the specified Cube information and requirement description into corresponding parameters and call the createIndicator tool to create a new indicator.
{{role}}
Reference Documentations:
{{references}}
${makeCubeRulesPrompt()}

1. ${promptIndicatorCode(indicatorCodes().join(', '))}
2. Specifies the hierarchy name (not the level name) of the calendar dimension for this metric, which is used to calculate the metric trend at different time granularities in the future, if you can find a hierarchy of calendar dimension with multiple time granularities levels.
3. If the requirement specifies the member condition of the dimension to be limited, then determine which dimension and member description needs to be limited based on the cube dimension information. Call the '${MEMBER_RETRIEVER_TOOL_NAME}' tool to obtain the accurate information of the dimension member and add it to the filters.
4. First, select a suitable measure from the Measures of the Cube as the measure field for defining the basic type of indicator. If the measure field of the basic indicator cannot meet the requirements, consider creating an MDX formula of calculated measure as the formula for the derived indicator. You don't need to multiply by 100 when defining a percentage formula
5. Fill the 'dimensions' parameter with all dimensions (non-hierarchies) that are not used in filters, formulas, or calendar.
6. If the indicator value is a ratio or percentage, you need to set unit to '%'.
7. ${CubeVariablePrompt}
8. Select the appropriate Business Areas from the following to fill in the businessAreaId field:
${markdownBusinessAreas(businessAreas())}
9. Select the relevant tags from the following and fill in the tags field:
${markdownTags(tags())}
If no Cube information is provided or you need to reselect a Cube, please call the 'pickCube' tool to get the Cube information.
` +

    `\n{{context}}` + 
    `\nCurrent indicator info is:` + 
    `\n{{indicator}}`
  return await Route.createWorkerAgent(llm, tools, systemPrompt, null, 'mustache')
}
