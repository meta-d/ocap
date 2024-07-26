import { z } from 'zod'

export const StoryPageSchema = z.object({
  name: z.string().describe(`The page title of story`),
  description: z.string().describe(`The page description of story`),
  gridOptions: z.object({
    columns: z.number().describe('Number of columns of layout'),
    rows: z.number().describe('Number of rows of layout'),
  })
})
