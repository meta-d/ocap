import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NGXLogger } from 'ngx-logger'
import z from 'zod'

export function injectCreateChartTool(createChart: (chart) => Promise<string>) {
  const logger = inject(NGXLogger)

  const createChartTool = new DynamicStructuredTool({
    name: 'createChart',
    description: 'Create chart function logic',
    schema: CreateChartSchema,
    func: createChart
  })

  return createChartTool
}

export const CreateChartSchema = z.object({
  logic: z.string().describe(`Chart custom logic body`)
})
