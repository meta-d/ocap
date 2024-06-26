import { Indicator } from '@metad/cloud/state'
import { Team } from 'apps/cloud/src/app/@core/copilot'

export const PLANNER_NAME = 'Planner'
export const SUPERVISOR_NAME = 'Supervisor'

export const INDICATOR_AGENT_NAME = 'IndicatorAgent'

// Define the top-level State interface
export interface State extends Team.State {
  plan: string[]
}

export function markdownIndicators(indicators: Indicator[]) {
  return indicators
    .map((indicator) => ` -name: ${indicator.name}\n  code: ${indicator.code}\n  business: ${indicator.business || ''}`)
    .join('\n')
}
