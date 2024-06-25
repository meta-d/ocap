import { inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { markdownEntityType } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import z from 'zod'

export function injectPickCubeTool() {
  const logger = inject(NGXLogger)
  const dsCoreService = inject(NgmDSCoreService)
  const _dialog = inject(MatDialog)
  const storyService = inject(NxStoryService)

  const pickCubeTool = new DynamicStructuredTool({
    name: 'pickCube',
    description: 'Pick a cube.',
    schema: z.object({}),
    func: async () => {
      logger.debug(`Execute copilot action 'pickCube'`)

      const result = await storyService.openDefultDataSettings()

      const cube = result?.entities[0]
      if (result?.dataSource && cube) {
        const entityType = await firstValueFrom(
          storyService.selectEntityType({ dataSource: result.dataSource, entitySet: cube })
        )
        return `Use model id: '${result.modelId}' and cube: '${cube}'\n` + markdownEntityType(entityType)
      }

      return ''
    }
  })

  return pickCubeTool
}
