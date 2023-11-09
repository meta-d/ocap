import { CopilotCommand } from '@metad/copilot'
import { editControlWidgetCommand } from './chat'
export * from './schema'

export const ControlCommand = {
  name: 'control',
  description: 'Edit input control attributes of widget',
  examples: [
    'add input control for dimension "XXXX"',
  ],
  processor: editControlWidgetCommand
} as CopilotCommand