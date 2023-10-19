import { CopilotDefaultOptions } from '@metad/copilot'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export const DimensionSchema = z.object({
  __id__: z.string().optional().describe('The id of the dimension'),
  name: z.string().describe('The name of the dimension'),
  caption: z.string().describe('The caption of the dimension'),
  hierarchies: z
    .array(
      z.object({
        __id__: z.string().optional().describe('The id of the hierarchy'),
        name: z.string().describe('The name of the hierarchy'),
        caption: z.string().describe('The caption of the hierarchy'),
        tables: z.array(
          z.object({
            name: z.string().describe('The name of the dimension table')
            // join: z.object({})
          })
        ),
        primaryKey: z.string().describe('The primary key of the dimension table'),
        levels: z
          .array(
            z.object({
              __id__: z.string().optional().describe('The id of the level'),
              name: z.string().describe('The name of the level'),
              caption: z.string().describe('The caption of the level'),
              column: z.string().describe('The column of the level')
            })
          )
          .describe('An array of levels in this hierarchy')
      })
    )
    .describe('An array of hierarchies in this dimension')
})


export const editModelDimension = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'edit-model-dimension',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(DimensionSchema)
    }
  ],
  function_call: { name: 'edit-model-dimension' }
}