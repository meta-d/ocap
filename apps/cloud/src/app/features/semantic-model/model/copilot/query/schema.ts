import { CopilotDefaultOptions } from '@metad/copilot'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { QueryCubeSchema } from '../schema'

export const queryCube = {
  ...CopilotDefaultOptions,
  functions: [
    {
      name: 'query-cube',
      description: 'Should always be used to properly format output',
      parameters: zodToJsonSchema(QueryCubeSchema)
    }
  ],
  function_call: { name: 'query-cube' }
}
