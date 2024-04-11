import { inject } from '@angular/core'
import { calcEntityTypePrompt, zodToProperties } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { EntityType } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { ChartWidgetSchema } from './schema'

/**
 * @todo 工作量大
 * 
 * @param storyService 
 * @returns 
 */
export function injectStoryWidgetCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)

  const widget = storyService.currentWidget()
  const page = storyService.currentStoryPoint()

  logger.debug(`Original chart widget is`, widget, page)

  const widgetKey = widget?.key
  const pageKey = page?.key

  let dataSourceName: string | null = null
  let defaultCube: EntityType | null = null

  return injectCopilotCommand({
    name: 'widget',
    description: 'Describe the widget you want',
    systemPrompt:
      () => `You are a BI analysis expert, please edit or create the chart widget configuration based on the cube information and the question.
One dimension can only be used once. one hierarchy can't appears in more than one independent axis.
The cube is:
\`\`\`
${defaultCube ? calcEntityTypePrompt(defaultCube) : 'unknown'}
\`\`\`

Original widget is:
\`\`\`
${JSON.stringify(widget ?? 'empty')}
\`\`\`
`,
    actions: [
      injectMakeCopilotActionable({
        name: 'modify_widget',
        description: 'Modify widget component settings',
        argumentAnnotations: [
          {
            name: 'widget',
            type: 'object',
            description: 'Widget settings',
            properties: zodToProperties(ChartWidgetSchema),
            required: true
          }
        ],
        implementation: async (widget) => {
          logger.debug(`Function calling 'modify_widget', params is:`, widget)

          return `✅`
        }
      })
    ]
  })
}
