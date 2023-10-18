import { DimensionSchema, MeasureSchema } from '@metad/core'
import { CopilotDefaultOptions, WidgetComponentType } from '@metad/story/core'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { ChartSchema } from '../chart/schema'

export const StoryPagesSchema = z.object({
  pages: z.array(
    z.object({
      title: z.string().describe(`The page title of story`),
      description: z.string().describe(`The page description of story: widgets, charts, filters, etc.`),
      widgets: z.array(
        z.object({
          title: z.string().describe(`Title of the widget`),
          position: z.object({
            x: z.number().describe(`Position x of the widget in the page layout`),
            y: z.number().describe(`Position y of the widget in the page layout`),
            cols: z.number().describe('Width of the widget in page layout'),
            rows: z.number().describe('Height of the widget in page layout')
          }),

          component: z
            .enum([
              WidgetComponentType.AnalyticalCard,
              WidgetComponentType.AnalyticalGrid,
              WidgetComponentType.InputControl
            ])
            .describe('The component type of widget')
        })
      )
    })
  )
})

export const StoryPageSchema = z.object({
  title: z.string().describe(`The page title of story`),
  description: z.string().describe(`The page description of story`),
  widgets: z
    .array(
      z.object({
        title: z.string().describe(`Title of the widget`),
        position: z.object({
          x: z.number().describe(`Position x of the widget in the page layout`),
          y: z.number().describe(`Position y of the widget in the page layout`),
          cols: z.number().describe('Width of the widget in page layout'),
          rows: z.number().describe('Height of the widget in page layout')
        }),

        component: z
          .enum([
            WidgetComponentType.AnalyticalCard,
            WidgetComponentType.AnalyticalGrid,
            WidgetComponentType.InputControl
          ])
          .describe('The component type of widget'),

        dataSettings: z.object({
          chartAnnotation: ChartSchema.optional().describe('Chart settings for AnalyticalCard widget'),
          analytics: z
            .object({
              rows: z.array(DimensionSchema),
              columns: z.array(DimensionSchema)
            })
            .optional()
            .describe('Grid settings for AnalyticalGrid widget')
        })
      })
    )
    .describe('The array of widgets in the page')
})

export const StoryWidgetGridSchema = z.object({
  rows: z.array(DimensionSchema),
  columns: z.array(MeasureSchema)
})

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
  analytics: StoryWidgetGridSchema.optional().describe(
    'Grid settings when component type of widget is AnalyticalGrid;'
  ),
  gridSettings: z.object({
    showToolbar: z.boolean().default(true).optional().describe('Show toolbar in AnalyticalGrid widget')
  })
})

export const discoverStory = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'discover-story',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(StoryPagesSchema)
    }
  ],
  function_call: { name: 'discover-story' }
}

export const discoverStoryPage = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'discover-story-page',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(StoryPageSchema)
    }
  ],
  function_call: { name: 'discover-story-page' }
}

export const discoverStoryWidget = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'discover-story-widget',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(StoryWidgetSchema)
    }
  ],
  function_call: { name: 'discover-story-widget' }
}
