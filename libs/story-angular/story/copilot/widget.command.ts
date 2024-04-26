import { inject } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { DeepPartial, calcEntityTypePrompt } from '@metad/core'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { NxStoryService, StoryWidget, WidgetComponentType } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { ChartWidgetSchema, chartAnnotationCheck, completeChartAnnotation } from './schema'
import { createStoryPickCubeTool } from './pick-cube-tool'
import { firstValueFrom } from 'rxjs'

/**
 */
export function injectStoryWidgetCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)

  const currentWidget = storyService.currentWidget
  const currentStoryPoint = storyService.currentStoryPoint

  const { defaultDataSource, defaultCube, tool } = createStoryPickCubeTool(storyService)

  const createWidgetTool = new DynamicStructuredTool({
    name: 'create_widget',
    description: 'Create a new widget in story page.',
    schema: ChartWidgetSchema,
    func: async ({ title, position, dataSettings, chartAnnotation }) => {
      console.log('create_widget', title, position, dataSettings, chartAnnotation)

      const entityType = defaultCube()
      storyService.createStoryWidget({
        component: WidgetComponentType.AnalyticalCard,
        position: position,
        title: title,
        dataSettings: {
          ...dataSettings,
          chartAnnotation: completeChartAnnotation(chartAnnotationCheck(chartAnnotation, entityType))
        }
      })

      return `Story widget created!`
    }
  })

  const updateWidgetTool = new DynamicStructuredTool({
    name: 'update_widget',
    description: 'Update a widget in story page.',
    schema: ChartWidgetSchema,
    func: async ({ title, position, dataSettings, chartAnnotation }) => {
      console.log('update_widget', title, position, dataSettings, chartAnnotation)

      const { dataSource, entitySet } = currentWidget()?.dataSettings ?? {}
      const entityType = await firstValueFrom(
        storyService.selectEntityType({ dataSource, entitySet })
      )
      
      storyService.updateWidget({
        widgetKey: currentWidget()?.key,
        widget: {
          title,
          position: position,
          dataSettings: {
            chartAnnotation: completeChartAnnotation(chartAnnotationCheck(chartAnnotation, entityType))
          }
        }
      })
      return `Story widget updated!`
    }
  })

  const tools = [tool, createWidgetTool, updateWidgetTool]

  return injectCopilotCommand({
    name: 'widget',
    description: 'Describe the widget you want',
    systemPrompt: () => {
      logger.debug(`Original chart widget:`, currentWidget()?.title, ' on page:', currentStoryPoint()?.name)
      return `The cube is:
\`\`\`
${defaultCube() ? calcEntityTypePrompt(defaultCube()) : 'unknown'}
\`\`\`

Original widget is:
\`\`\`
${JSON.stringify(currentWidget() ?? 'empty')}
\`\`\`

Don't need pick a default cube unless there is no cube provided or user want to change the cube.
`
    },
    tools,
    prompt: ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a BI analysis expert, please edit or create the chart widget configuration based on the cube information and the question.
One dimension can only be used once. one hierarchy can't appears in more than one independent axis.
{system_prompt}
`
      ],
      new MessagesPlaceholder({
        variableName: 'chat_history',
        optional: true
      }),
      ['user', '{input}'],
      new MessagesPlaceholder('agent_scratchpad')
    ])
  })
}
