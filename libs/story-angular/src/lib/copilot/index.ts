export * from './control/index'
export * from './common'

import { registerCommand } from '@metad/copilot'
import { StoryCopilotCommandArea } from '@metad/story/core'
import { ChartCommand } from './chart'
import { ControlCommand } from './control/index'
import { GridCommand } from './grid'
import { StoryCommand } from './story'
import { StyleCommand } from './style'

export function registerStoryCommands() {
  registerCommand(StoryCopilotCommandArea, ControlCommand)
  registerCommand(StoryCopilotCommandArea, GridCommand)
  registerCommand(StoryCopilotCommandArea, ChartCommand)
  registerCommand(StoryCopilotCommandArea, StoryCommand)
  registerCommand(StoryCopilotCommandArea, StyleCommand)
}
