import { CopilotChatMessageRoleEnum, getFunctionCall } from '@metad/copilot'
import { calcEntityTypePrompt } from '@metad/core'
import {
  AnalyticsAnnotation,
  C_MEASURES,
  ChartAnnotation,
  Dimension,
  EntityType,
  Measure,
  PropertyDimension,
  PropertyLevel,
  assignDeepOmitBlank,
  getEntityProperty,
  getEntityProperty2,
  omitBlank
} from '@metad/ocap-core'
import { map, of } from 'rxjs'
import zodToJsonSchema from 'zod-to-json-schema'
import { StoryWidgetSchema } from '../schema'
import { CopilotChartConversation } from '../types'
import { WidgetComponentType } from '../../types'

export function chatStoryWidget(copilot: CopilotChartConversation) {
  const { copilotService, prompt, entityType } = copilot
  const systemPrompt = `You are a BI analysis expert, please provide dashboard widget configuration based on the cube information and the question.
一个 dimension 只能使用一次; one hierarchy can't appears in more than one independent axis.
Cube is ${calcEntityTypePrompt(entityType)}`

  return copilotService
    .chatCompletions(
      [
        {
          role: CopilotChatMessageRoleEnum.System,
          content: systemPrompt
        },
        {
          role: CopilotChatMessageRoleEnum.User,
          content: prompt
        }
      ],
      {
        model: 'gpt-3.5-turbo-0613',
        temperature: 0.2,
        functions: [
          {
            name: 'add-story-widget',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(StoryWidgetSchema)
          }
        ],
        function_call: { name: 'add-story-widget' },
        ...omitBlank(copilot.options)
      }
    )
    .pipe(
      map(({ choices }) => {
        try {
          copilot.response = getFunctionCall(choices[0].message)
        } catch (err) {
          copilot.error = err as Error
        }
        return copilot
      })
    )
}

export function createStoryWidget(copilot: CopilotChartConversation) {
  const { logger, storyService, dataSource, entityType } = copilot

  logger?.debug(`Chat widget response is`, copilot.response)
  const widget = copilot.response.arguments
  storyService.createStoryWidget(
    assignDeepOmitBlank(
      {
        dataSettings: {
          dataSource,
          entitySet: entityType.name
        }
      },
      {
        ...copilot.response.arguments,
        dataSettings: {
          ...(copilot.response.arguments.dataSettings ?? {}),
          chartAnnotation: chartAnnotationCheck(copilot.response.arguments.chartAnnotation, entityType),
          analytics: analyticsAnnotationCheck(copilot.response.arguments.analytics, entityType)
        },
        options: widget.component === WidgetComponentType.AnalyticalGrid ? widget.gridSettings : {}
      },
      5
    )
  )

  return of(copilot)
}

/**
 * @unresolved AI Copilot maybe pass hierarchy or level to the dimension, which needs to be converted to the exact dimension
 *
 * @param chartAnnotation
 * @param entityType
 * @returns
 */
export function chartAnnotationCheck(chartAnnotation: ChartAnnotation, entityType: EntityType): ChartAnnotation {
  if (!chartAnnotation) {
    return chartAnnotation
  }
  return {
    ...chartAnnotation,
    dimensions: chartAnnotation.dimensions.map((item) => fixDimension(item, entityType))
  }
}

export function fixDimension(item: Dimension, entityType: EntityType) {
  let { dimension, hierarchy } = item

  let property: PropertyLevel | PropertyDimension = getEntityProperty<PropertyDimension>(entityType, dimension)
  if (!property) {
    property = getEntityProperty2(entityType, dimension)
    dimension = property.dimension
    hierarchy = (<PropertyLevel>property).hierarchy ?? property.name
  }

  return {
    ...item,
    dimension,
    hierarchy
  }
}

export function fixMeasure(item: Measure | Dimension, entityType: EntityType) {
  return {
    ...item,
    dimension: item.dimension === `[${C_MEASURES}]` ? C_MEASURES : item.dimension
  }
}

export function analyticsAnnotationCheck(analytics: AnalyticsAnnotation, entityType: EntityType) {
  if (!analytics) {
    return analytics
  }

  return {
    ...analytics,
    rows: analytics.rows.map((item) => fixDimension(item, entityType)),
    columns: analytics.columns.map((item) => fixMeasure(item, entityType))
  }
}
