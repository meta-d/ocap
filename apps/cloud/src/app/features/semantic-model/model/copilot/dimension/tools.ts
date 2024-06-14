import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { DimensionSchema } from '../schema'
import { createDimension } from './chat'

export function injectCreateDimensionTool() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)

  const createDimensionTool = new DynamicStructuredTool({
    name: 'createDimension',
    description: 'Create or edit shared dimension for cube.',
    schema: DimensionSchema,
    func: async (d) => {
      logger.debug(`Execute copilot action 'createDimension':`, d)
      createDimension(modelService, d as any)
      return translate.instant('PAC.MODEL.Copilot.CreatedDimension', { Default: 'Created Dimension!' })
    }
  })
  
  return createDimensionTool
}
