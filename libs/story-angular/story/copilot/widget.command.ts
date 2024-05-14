import { computed, inject, signal } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import { makeCubeRulesPrompt, markdownEntityType, tryFixSlicer } from '@metad/core'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { NxStoryService, WidgetComponentType, uuid } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { firstValueFrom, of } from 'rxjs'
import { z } from 'zod'
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
import { MEMBER_RETRIEVER_TOKEN, createDimensionMemberRetrieverTool } from './types'

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
  const memberRetriever = inject(MEMBER_RETRIEVER_TOKEN)

  const currentWidget = storyService.currentWidget
  const currentStoryPoint = storyService.currentStoryPoint

  const defaultModel = signal<string>(null)
  const defaultDataSource = signal<string>(null)
  const defaultEntity = signal<string>(null)
  const defaultDataSettings = computed(() => {
    const entitySet = defaultEntity()
    const dataSource = defaultDataSource()
    return dataSource && entitySet
      ? {
          dataSource,
          entitySet
        }
      : null
  })
  const defaultCube = derivedAsync(() => {
    const dataSettings = defaultDataSettings()
    return dataSettings ? storyService.selectEntityType(dataSettings) : of(null)
  })

  // try {
  //   ChartWidgetSchema.parse(JSON.parse("{\n  \"title\": \"Sales Amount by Customer Country\",\n  \"position\": {\n    \"x\": 0,\n    \"y\": 0,\n    \"cols\": 6,\n    \"rows\": 6\n  },\n  \"dataSettings\": {\n    \"limit\": 100\n  },\n  \"chart\": {\n    \"chartType\": {\n      \"type\": \"Pie\",\n      \"chartOptions\": {\n        \"seriesStyle\": {},\n        \"legend\": {},\n        \"axis\": {},\n        \"dataZoom\": {},\n        \"tooltip\": {},\n        \"aria\": {\n          \"enabled\": true,\n          \"decal\": {\n            \"show\": true\n          }\n        }\n      }\n    },\n    \"dimensions\": [\n      {\n        \"dimension\": \"[Customer]\",\n        \"hierarchy\": \"[Customer.Geography]\",\n        \"level\": \"[Customer.Geography].[Country Region]\"\n      }\n    ],\n    \"measures\": [\n      {\n        \"dimension\": \"Measures\",\n        \"measure\": \"Sales Amount\",\n        \"order\": \"DESC\",\n        \"chartOptions\": {}\n      }\n    ]\n  },\n  \"slicers\": [\n    {\n      \"dimension\": {\n        \"dimension\": \"[Product]\",\n        \"hierarchy\": \"[Product.Products]\",\n        \"level\": \"[Product.Products].[Category]\"\n      },\n      \"members\": [\n        {\n          \"key\": \"[Product.Products].[Accessories]\",\n          \"caption\": \"Accessories\"\n        }\n      ]\n    }\n  ]\n}"))
  // } catch (error) {
  //   console.error('ChartWidgetSchema.parse error:', error)
  // }

  const createChartTool = new DynamicStructuredTool({
    name: 'createChartWidget',
    description: 'Create a new widget in story page.',
    schema: ChartWidgetSchema,
    func: async ({ title, position, dataSettings, chart, slicers }) => {
      logger.debug(
        '[Story] [AI Copilot] [Command tool] [createChartWidget] inputs:',
        'title:',
        title,
        'position:',
        position,
        'dataSettings:',
        dataSettings,
        'chartAnnotation:',
        chart,
        'slicers:',
        slicers
      )

      try {
        const entityType = defaultCube()
        storyService.createStoryWidget({
          component: WidgetComponentType.AnalyticalCard,
          position: position ?? { x: 0, y: 0, rows: 5, cols: 5 },
          title: title,
          dataSettings: {
            ...(dataSettings ?? {}),
            ...(defaultDataSettings() ?? {}),
            chartAnnotation: completeChartAnnotation(chartAnnotationCheck(chart, entityType)),
            selectionVariant: {
              selectOptions: (slicers ?? ((<any>chart).slicers as any[]))?.map((slicer) =>
                tryFixSlicer(slicer, entityType)
              )
            }
          }
        })
      } catch (error) {
        return `Error: ${error}`
      }

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
        },
        options
      })

      return `Story table widget '${key}' created!`
    }
  })

  const updateWidgetTool = new DynamicStructuredTool({
    name: 'updateWidget',
    description: 'Update a widget in story page.',
    schema: ChartWidgetSchema,
    func: async ({ title, position, dataSettings, chart }) => {
      console.log('updateWidget', title, position, dataSettings, chart)

      const { dataSource, entitySet } = currentWidget()?.dataSettings ?? {}
      const entityType = await firstValueFrom(storyService.selectEntityType({ dataSource, entitySet }))

      storyService.updateWidget({
        widgetKey: currentWidget()?.key,
        widget: {
          title,
          position: position,
          dataSettings: {
            chartAnnotation: completeChartAnnotation(chartAnnotationCheck(chart, entityType))
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

  return injectCopilotCommand(
    'widget',
    (async () => {
      const memberRetrieverTool = await createDimensionMemberRetrieverTool(memberRetriever, defaultModel, defaultEntity)

      const tools = [
        // tool,
        memberRetrieverTool,
        createTableTool,
        createChartTool
        // updateWidgetTool,
        // updateWidgetStyleTool,
        // ...createUpdateChartTools(storyService),
      ]
      return {
        alias: 'w',
        description: 'Describe the widget you want',
        agent: {
          type: CopilotAgentType.Default
        },
        systemPrompt: async ({ params }) => {
          logger.debug(`Original chart widget:`, currentWidget()?.title, ' on page:', currentStoryPoint()?.name)

          let prompt = ''
          const cubeParams = params?.filter((param) => param.item)
          if (cubeParams?.length) {
            defaultModel.set(cubeParams[0].item.value.dataSourceId)
            defaultDataSource.set(cubeParams[0].item.value.dataSource.key)
            defaultEntity.set(cubeParams[0].item.key)
          } else {
            if (!defaultModel() || !defaultEntity()) {
              const result = await storyService.openDefultDataSettings()

              if (result?.dataSource && result?.entities[0]) {
                defaultModel.set(result.modelId)
                defaultDataSource.set(result.dataSource)
                defaultEntity.set(result.entities[0])
              }
            }

            prompt += `The Cube structure is:
\`\`\`
${defaultCube() ? markdownEntityType(defaultCube()) : 'unknown'}
\`\`\`
`
          }

          return `${prompt}
Original widget is:
\`\`\`
${JSON.stringify(currentWidget() ?? 'empty')}
\`\`\`
`
        },
        tools,
        prompt: ChatPromptTemplate.fromMessages([
          [
            'system',
            `You are a BI analysis expert. Please use MDX technology to edit or create chart widget configurations based on Cube information.
You must first call the 'dimensionMemberKeySearch' tool to obtain documentation related to dimension member keys (unique member name).
A dimension can only be used once, and a hierarchy cannot appear on multiple independent axes.

${makeCubeRulesPrompt()}

for examples

qustion: 'sales amout by customer country filter by product bikes'
think: call 'dimensionMemberKeySearch' tool with query param 'product bikes' to get member key of 'product bikes'

{context}

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
      }
    })()
  )
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

  return injectCopilotCommand('chartStyle', {
    alias: 'cs',
    description: 'How to style the chart widget you want',
    agent: {
      type: CopilotAgentType.Default
    },
    systemPrompt: async () => {
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
