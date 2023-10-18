import { registerCommand } from '@metad/copilot'
import { CubeCommand } from './cube'
import { ModelCopilotCommandArea } from './types'
import { CalculatedMeasureCommand } from './calc-measure'

export * from './model-copilot.service'
export * from './types'

export function registerModelCommands() {
  registerCommand(ModelCopilotCommandArea, CubeCommand)
  registerCommand(ModelCopilotCommandArea, CalculatedMeasureCommand)
}
