import { CopilotDefaultOptions } from '@metad/copilot'
import { DimensionSchema } from '@metad/core'
import { AnalyticsAnnotation, EntityType } from '@metad/ocap-core'
import { fixDimension } from '@metad/story/core'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export const GridWidgetSchema = z.object({
  title: z.string().describe(`Title of the widget`),
  position: z.object({
    x: z.number().describe(`Position x of the widget in the page layout`),
    y: z.number().describe(`Position y of the widget in the page layout`),
    cols: z.number().describe('Width of the widget in page layout'),
    rows: z.number().describe('Height of the widget in page layout')
  }),

  analytics: z
    .object({
      rows: z.array(DimensionSchema),
      columns: z.array(DimensionSchema)
    })
    .optional()
    .describe('Grid data settings for AnalyticalGrid widget'),
  
  /**
   * Refer to {@link WidgetAnalyticalGridOptions }
   */
  options: z.object({
    showToolbar: z.boolean().default(true).optional().describe('Show toolbar'),
    strip: z.boolean().optional().describe('Is strip'),
    grid: z.boolean().optional().describe('Is grid'),
    paging: z.boolean().default(true).optional().describe('Is paging'),
    pageSize: z.number().optional().describe('Page size'),
    sticky: z.boolean().optional().describe('Is sticky'),
    hideDataDownload: z.boolean().optional().describe('Hide data download'),
    initialRowLevel: z.number().optional().describe('Initial row level'),
    initialColumnLevel: z.number().optional().describe('Initial column level'),
    sortable: z.boolean().optional().describe('Is sortable'),
    selectable: z.boolean().optional().describe('Is selectable'),
    digitsInfo: z.string().optional().describe('Digits info'),
    unit: z.string().optional().describe('Unit'),
    currencyCode: z.string().optional().describe('Currency code'),
  }).optional().describe('Grid options for AnalyticalGrid widget'),
})

export const editWidgetGrid = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'edit-story-widget-grid',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(GridWidgetSchema)
    }
  ],
  function_call: { name: 'edit-story-widget-grid' }
}

export function analyticsAnnotationCheck(analytics: AnalyticsAnnotation, entityType: EntityType) {
  if (!analytics) {
    return analytics
  }

  return {
    ...analytics,
    rows: analytics.rows?.map((item) => fixDimension(item, entityType)),
    columns: analytics.columns?.map((item) => fixDimension(item, entityType))
  }
}