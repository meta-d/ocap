import { CopilotDefaultOptions } from '@metad/copilot'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export const CalculatedMeasureSchema = z.object({
  expression: z.string().describe('The MDX expression for the calculated measure')
})

export const editModelExpression = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'edit-model-expression',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(CalculatedMeasureSchema)
    }
  ],
  function_call: { name: 'edit-model-expression' }
}
