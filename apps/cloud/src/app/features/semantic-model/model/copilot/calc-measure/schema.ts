import { CopilotDefaultOptions } from '@metad/copilot'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'


export const CalculatedMeasureSchema = z.object({
  name: z.string().describe('Name of the calculated measure'),
  caption: z.string().optional().describe('Caption of the calculated measure'),
  formula: z.string().describe('MDX expression for the calculated measure in cube')
})

export const editModelExpression = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'edit-calculated-measure',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(CalculatedMeasureSchema)
    }
  ],
  function_call: { name: 'edit-calculated-measure' }
}
