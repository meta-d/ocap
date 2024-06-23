import { Indicator } from '@metad/cloud/state'

export const PLANNER_NAME = 'Planner'
export const SUPERVISOR_NAME = 'Supervisor'

export const INDICATOR_AGENT_NAME = 'IndicatorAgent'

export function markdownIndicators(indicators: Indicator[]) {
  return indicators
    .map((indicator) => ` -name: ${indicator.name}\n  code: ${indicator.code}\n  business: ${indicator.business || ''}`)
    .join('\n')
}
