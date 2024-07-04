import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { SemanticModelService } from '../../model.service'
import { CubeSchema } from '../schema'
import { createOrEditCube } from './chat'

export function injectCreateCubeTool() {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const modelService = inject(SemanticModelService)

  const createCubeTool = new DynamicStructuredTool({
    name: 'createCube',
    description: 'Create or edit cube',
    schema: CubeSchema,
    func: async (cube) => {
      logger.debug(`Execute copilot action 'createCube':`, cube)
      createOrEditCube(modelService, cube as any)
      return translate.instant('PAC.MODEL.Copilot.CreatedCube', { Default: 'Created Cube!' })
    }
  })

  return createCubeTool
}
