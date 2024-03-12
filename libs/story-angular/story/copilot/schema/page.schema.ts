import { z } from 'zod'

export const StoryPageSchema = z.object({
  name: z.string().describe(`The page title of story`),
  description: z.string().describe(`The page description of story`),
})
