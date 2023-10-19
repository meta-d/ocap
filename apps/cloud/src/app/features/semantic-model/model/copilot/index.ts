import { registerCommand } from '@metad/copilot'
import { CubeCommand } from './cube'
import { ModelCopilotCommandArea } from './types'
import { CalculatedMeasureCommand, FixCalculatedMeasureCommand } from './calc-measure'
import { DimensionCommand } from './dimension'
import { QueryCommand } from './query'

export * from './model-copilot.service'
export * from './types'

export function registerModelCommands() {
  registerCommand(ModelCopilotCommandArea, DimensionCommand)
  registerCommand(ModelCopilotCommandArea, CubeCommand)
  registerCommand(ModelCopilotCommandArea, CalculatedMeasureCommand)
  registerCommand(ModelCopilotCommandArea, FixCalculatedMeasureCommand)
  registerCommand(ModelCopilotCommandArea, QueryCommand)
}
