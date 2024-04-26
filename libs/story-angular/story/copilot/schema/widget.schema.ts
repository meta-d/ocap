import { EntityType } from '@metad/ocap-core'
import { StoryPoint, WidgetComponentType } from '@metad/story/core'
import { z } from 'zod'
import { tryFixAnalyticsAnnotation } from '../types'
import { ChartSchema, chartAnnotationCheck, completeChartAnnotation } from './chart.schema'
import { AnalyticsAnnotationSchema } from './grid.schema'

export const StoryWidgetSchema = z.object({
  title: z.string().describe(`Title of the widget`),
  position: z.object({
    x: z.number().describe(`Position x of the widget in the page layout`),
    y: z.number().describe(`Position y of the widget in the page layout`),
    cols: z.number().describe('Width of the widget in page layout'),
    rows: z.number().describe('Height of the widget in page layout')
  }),

  component: z
    .enum([WidgetComponentType.AnalyticalCard, WidgetComponentType.AnalyticalGrid, WidgetComponentType.InputControl])
    .describe('The component type of widget'),

  chartAnnotation: ChartSchema.optional().describe('Chart settings when component type of widget is AnalyticalCard'),
  analytics: AnalyticsAnnotationSchema.optional().describe(
    'Grid settings when component type of widget is AnalyticalGrid;'
  ),
  gridSettings: z.object({
    showToolbar: z.boolean().default(true).optional().describe('Show toolbar in AnalyticalGrid widget')
  })
})

// export function schemaToWidget(schema: any, dataSource: string, entityType: EntityType): StoryPoint {
//   return {
//     name: schema.title,
//     ...schema,
//     position: schema.position,
//     dataSettings: {
//       dataSource,
//       entitySet: entityType.name,
//       chartAnnotation: completeChartAnnotation(chartAnnotationCheck(schema.chartAnnotation, entityType, schema)),
//       analytics: tryFixAnalyticsAnnotation(entityType, schema.analytics)
//     },
//     options: {
//       gridSettings: schema.gridSettings
//     }
//   }
// }
