import { CopilotDefaultOptions } from '@metad/copilot'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export const CubeSchema = z.object({
  name: z.string().optional().describe('The name of the cube'),
  caption: z.string().optional().describe('The caption of the cube'),
  tables: z.array(
    z.object({
      name: z.string().describe('The name of the cube fact table')
      // join: z.object({})
    })
  ).optional(),
  measures: z
    .array(
      z.object({
        name: z.string().describe('The name of the measure'),
        caption: z.string().describe('The caption of the measure'),
        column: z.string().describe('The column of the measure')
      })
    )
    .optional()
    .describe('An array of measures in this cube'),
  dimensions: z
    .array(
      z.object({
        name: z.string().describe('The name of the dimension'),
        caption: z.string().describe('The caption of the dimension'),
        hierarchies: z
          .array(
            z.object({
              name: z.string().describe('The name of the hierarchy'),
              caption: z.string().describe('The caption of the hierarchy'),
              tables: z.array(
                z.object({
                  name: z.string().describe('The name of the dimension table')
                  // join: z.object({})
                })
              ),
              primaryKey: z.string().describe('The primary key of the dimension table'),
              hasAll: z.boolean().describe('Whether the hierarchy has an all level'),
              levels: z
                .array(
                  z.object({
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
    )
    .optional()
    .describe('An array of dimensions in this cube'),

  dimensionUsages: z
    .array(
      z.object({
        name: z.string().describe('The name of the dimension usage'),
        caption: z.string().optional().describe('The caption of the dimension usage'),
        source: z.string().describe('The name of the shared dimension'),
        foreignKey: z.string().describe('The foreign key of the fact table that join into the shared dimension'),
        description: z.string().optional().describe('The description of the dimension usage')
      })
    )
    .optional()
    .describe('An array of shared dimensions used in this cube')
})

export const editModelCube = {
    ...CopilotDefaultOptions,
    functions: [
      {
        name: 'edit-model-cube',
        description: 'Should always be used to properly format output',
        parameters: zodToJsonSchema(CubeSchema)
      }
    ],
    function_call: { name: 'edit-model-cube' }
  }