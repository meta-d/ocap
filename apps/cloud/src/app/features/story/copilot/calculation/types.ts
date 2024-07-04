import { MEMBER_RETRIEVER_TOOL_NAME } from "@metad/core"
import { Team } from "apps/cloud/src/app/@core/copilot"

export const SUPERVISOR_NAME = 'Supervisor'

export const FORMULA_AGENT_NAME = 'FormulaMeasureAgent'
export const RESTRICTED_AGENT_NAME = 'RestrictedMeasureAgent'
export const CONDITIONAL_AGGREGATION_AGENT_NAME = 'ConditionalAggregationAgent'
export const VARIANCE_AGENT_NAME = 'VarianceMeasureAgent'
export const MEASURE_CONTROL_AGENT_NAME = 'MeasureControlAgent'

export const MEMBER_RETRIEVER_PROMPT = `If the requirement specifies the member condition of the dimension to be limited, then determine which dimension and member description needs to be limited based on the cube dimension information.` +
    ` Call the '${MEMBER_RETRIEVER_TOOL_NAME}' tool to obtain the accurate information of the dimension member.`


// Define the top-level State interface
export interface State extends Team.State {}