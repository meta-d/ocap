import { registerCommand } from '@metad/story/core'
import { editChartWidgetCommand } from './copilot/chat'

export * from './analytical-card.component'
export * from './analytical-card.module'
export * from './analytical-card.schema'
export * from './chart-property/chart-property.component'
export * from './chart-settings/chart-settings.component'
export * from './formly/index'
export * from './schemas/reference-line.schema'
export * from './chart-type/types'

registerCommand({
  name: 'chart',
  description: 'Edit chart attributes of widget',
  examples: [
    'change to doughnut chart with rounded corner item'
  ],
  processor: editChartWidgetCommand
})
