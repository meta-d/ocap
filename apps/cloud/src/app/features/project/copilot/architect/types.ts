import { Indicator } from '@metad/cloud/state'
import { Team } from '@metad/copilot'

export const IndicatorArchitectCommandName = 'indicator-architect'
export const PLANNER_NAME = 'Planner'
export const REPLANNER_NAME = 'Replanner'

export const INDICATOR_AGENT_NAME = 'IndicatorAgent'

// Define the top-level State interface
export interface IndicatorArchitectState extends Team.State {}

export function markdownIndicators(indicators: Indicator[]) {
  return indicators
    .map((indicator) => ` -name: ${indicator.name}\n  code: ${indicator.code}\n  business: ${indicator.business || ''}`)
    .join('\n') || 'Empty'
}
