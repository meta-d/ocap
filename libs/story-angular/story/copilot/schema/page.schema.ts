import { z } from 'zod'

export const StoryPageSchema = z.object({
  name: z.string().describe(`The page title of story`),
  description: z.string().describe(`The page description of story`),
  // widgets: z
  //   .array(
  //     z.object({
  //       title: z.string().describe(`Title of the widget`),
  //       position: z.object({
  //         x: z.number().describe(`Position x of the widget in the page layout`),
  //         y: z.number().describe(`Position y of the widget in the page layout`),
  //         cols: z.number().describe('Width of the widget in page layout'),
  //         rows: z.number().describe('Height of the widget in page layout')
  //       }),

  //       component: z
  //         .enum([
  //           WidgetComponentType.AnalyticalCard,
  //           WidgetComponentType.AnalyticalGrid,
  //           WidgetComponentType.InputControl
  //         ])
  //         .describe('The component type of widget'),

  //       dataSettings: z.object({
  //         chartAnnotation: ChartSchema.optional().describe('Chart settings for AnalyticalCard widget'),
  //         analytics: z
  //           .object({
  //             rows: z.array(DimensionSchema),
  //             columns: z.array(DimensionSchema)
  //           })
  //           .optional()
  //           .describe('Grid settings for AnalyticalGrid widget')
  //       })
  //     })
  //   )
  //   .describe('The array of widgets in the page')
})
