import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { DimensionSchema, MeasureSchema } from '@metad/core'
import { WidgetComponentType } from '../types'
import { ChartSchema } from './chart-schema'


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
            .describe('The component type of widget'),
          }))
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
          analytics: z.object({
            rows: z.array(DimensionSchema),
            columns: z.array(DimensionSchema),
          }).optional().describe('Grid settings for AnalyticalGrid widget'),
        })
      })
    )
    .describe('The array of widgets in the page')
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
    .enum([
      WidgetComponentType.AnalyticalCard,
      WidgetComponentType.AnalyticalGrid,
      WidgetComponentType.InputControl
    ])
    .describe('The component type of widget'),
  
  dataSettings: z.object({
    chartAnnotation: ChartSchema.optional().describe('Chart settings for AnalyticalCard widget'),
    analytics: z.object({
      rows: z.array(DimensionSchema),
      columns: z.array(DimensionSchema),
    }).optional().describe('Grid settings for AnalyticalGrid widget'),
  })
})

export const StoryWidgetGridSchema = z.object({
  rows: z.array(DimensionSchema),
  columns: z.array(MeasureSchema),
})

export const discoverStory = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2,
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
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2,
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
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2,
  functions: [
    {
      name: 'discover-story-widget',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(StoryWidgetSchema)
    }
  ],
  function_call: { name: 'discover-story-widget' }
}

export const discoverWidgetChart = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2,
  functions: [
    {
      name: 'discover-story-widget-chart',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(ChartSchema)
    }
  ],
  function_call: { name: 'discover-story-widget-chart' }
}

export const discoverWidgetGrid = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 0.2,
  functions: [
    {
      name: 'discover-story-widget-grid',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(StoryWidgetGridSchema)
    }
  ],
  function_call: { name: 'discover-story-widget-grid' }
}