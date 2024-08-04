import { z } from 'zod'

export const StoryPageSchema = z.object({
  name: z.string().describe(`The page title of story`),
  description: z.string().describe(`The page description of story`),
  gridOptions: z.object({
    columns: z.number().describe('Number of columns of layout'),
    rows: z.number().describe('Number of rows of layout')
  })
})

export const WidgetsLayoutSchema = z.object({
  widgets: z.array(
    z.object({
      key: z.string().describe('The key of widget'),
      position: z.object({
        x: z.number().describe(`Position x of the widget in the page layout`),
        y: z.number().describe(`Position y of the widget in the page layout`),
        cols: z.number().describe('Width of the widget in page layout'),
        rows: z.number().describe('Height of the widget in page layout')
      })
    })
  )
})
