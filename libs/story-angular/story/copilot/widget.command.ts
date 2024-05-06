import { inject } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { calcEntityTypePrompt } from '@metad/core'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { NxStoryService, WidgetComponentType, uuid } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { createStoryPickCubeTool } from './pick-cube-tool'
import {
  ChartSchema,
  ChartWidgetSchema,
  chartAnnotationCheck,
  completeChartAnnotation,
  createTableWidgetSchema,
  createWidgetSchema,
  createWidgetStyleSchema,
  tryFixAnalyticsAnnotation
} from './schema'

function createUpdateChartTools(storyService: NxStoryService) {
  return [
    new DynamicStructuredTool({
      name: 'updateChartStyle',
      description: 'Update sytle of chart widget in story page.',
      schema: z.object({
        key: z.string().describe('The key of the widget'),
        chart: ChartSchema.describe('The chart config')
      }),
      func: async ({ key, chart }) => {
        const entityType = await firstValueFrom(storyService.selectWidgetEntityType(key))
        storyService.updateWidget({
          widgetKey: key,
          widget: {
            dataSettings: {
              chartAnnotation: completeChartAnnotation(chartAnnotationCheck(chart, entityType))
            }
          }
        })
        return `The styles of story chart widget updated!`
      }
    })
  ]
}

/**
 */
export function injectStoryWidgetCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const currentWidget = storyService.currentWidget
  const currentStoryPoint = storyService.currentStoryPoint

  const { defaultDataSource, defaultCube, tool } = createStoryPickCubeTool(storyService)

  const createChartTool = new DynamicStructuredTool({
    name: 'createChartWidget',
    description: 'Create a new widget in story page.',
    schema: ChartWidgetSchema,
    func: async ({ title, position, dataSettings, chartAnnotation }) => {
      logger.debug(
        '[Story] [AI Copilot] [Command tool] [createChartWidget] inputs:',
        title,
        position,
        dataSettings,
        chartAnnotation
      )

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

      return `Story chart widget created!`
    }
  })

  const createTableTool = new DynamicStructuredTool({
    name: 'createTableWidget',
    description: 'Create a new table widget.',
    schema: createWidgetSchema(createTableWidgetSchema()),
    func: async ({ title, position, analytics, options }) => {
      logger.debug(
        '[Story] [AI Copilot] [Command tool] [createTableWidget] inputs:',
        title,
        position,
        analytics,
        options
      )

      const entityType = defaultCube()
      const key = uuid()
      storyService.createStoryWidget({
        key,
        component: WidgetComponentType.AnalyticalGrid,
        position: position,
        title: title,
        dataSettings: {
          analytics: tryFixAnalyticsAnnotation(analytics, entityType)
        }
      })

      return `Story table widget '${key}' created!`
    }
  })

  const updateWidgetTool = new DynamicStructuredTool({
    name: 'updateWidget',
    description: 'Update a widget in story page.',
    schema: ChartWidgetSchema,
    func: async ({ title, position, dataSettings, chartAnnotation }) => {
      console.log('updateWidget', title, position, dataSettings, chartAnnotation)

      const { dataSource, entitySet } = currentWidget()?.dataSettings ?? {}
      const entityType = await firstValueFrom(storyService.selectEntityType({ dataSource, entitySet }))

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

  const updateWidgetStyleTool = new DynamicStructuredTool({
    name: 'updateWidgetStyle',
    description: 'Update styles of the widget.',
    schema: z.object({
      key: z.string().describe('The key of the widget'),
      styles: createWidgetStyleSchema().describe('The styles of the widget')
    }),
    func: async ({ key, styles }) => {
      logger.debug('[Story] [AI Copilot] [Command tool] [updateWidgetStyle] inputs:', key, styles)
      storyService.updateWidget({
        widgetKey: key,
        widget: {
          styling: {
            component: styles
          }
        }
      })
      return `Story widget styles updated!`
    }
  })

  const tools = [
    tool,
    createTableTool,
    createChartTool,
    updateWidgetTool,
    updateWidgetStyleTool,
    ...createUpdateChartTools(storyService)
  ]

  return injectCopilotCommand({
    name: 'widget',
    alias: 'w',
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

/**
 * Edit styles for chart widget
 *
 * @param storyService
 * @returns
 */
export function injectWidgetStyleCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)

  const currentWidget = storyService.currentWidget
  const currentStoryPoint = storyService.currentStoryPoint

  const tools = [...createUpdateChartTools(storyService)]

  return injectCopilotCommand({
    name: 'chartStyle',
    alias: 'cs',
    description: 'How to style the chart widget you want',
    systemPrompt: () => {
      if (!currentWidget()) {
        throw new Error(
          translate.instant('Story.Copilot.PleaseSelectWidget', { Default: 'Please select a widget first.' })
        )
      }

      logger.debug(
        `[Story] [AI Command] [ws] original widget:`,
        currentWidget()?.title,
        ' on page:',
        currentStoryPoint()?.name
      )
      return `Original widget is:
\`\`\`
${JSON.stringify(currentWidget() ?? 'empty')}
\`\`\`
`
    },
    tools,
    prompt: ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a BI analysis expert, please edit chart configuration for the widget based on user question.
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
