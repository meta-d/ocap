export * from './control/index'

import { registerCommand } from '@metad/story/core'
import { ControlCommand } from './control/index'
import { GridCommand } from './grid'
import { ChartCommand } from './chart'
import { StoryCommand } from './story'
import { StyleCommand } from './style'

export function registerStoryCommands() {
    registerCommand(ControlCommand)
    registerCommand(GridCommand)
    registerCommand(ChartCommand)
    registerCommand(StoryCommand)
    registerCommand(StyleCommand)
}