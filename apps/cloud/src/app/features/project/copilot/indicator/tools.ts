import { inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { IndicatorFormulaSchema, IndicatorSchema, markdownEntityType } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { EntitySelectDataType, EntitySelectResultType, NgmEntityDialogComponent } from '@metad/ocap-angular/entity'
import { Indicator } from '@metad/ocap-core'
import { uuid } from 'apps/cloud/src/app/@core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import z from 'zod'
import { ProjectService } from '../../project.service'

export function injectCreateIndicatorTool() {
  const logger = inject(NGXLogger)
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const projectService = inject(ProjectService)

  const createIndicatorTool = new DynamicStructuredTool({
    name: 'createIndicator',
    description: 'Create a new indicator.',
    schema: IndicatorSchema,
    func: async (indicator) => {
      logger.debug(`Execute copilot action 'createIndicator':`, indicator)

      indicator.code ??= uuid()
      if (indicator.calendar) {
        const [hierarchy, level] = indicator.calendar.split('].[')
        indicator.calendar = level ? `${hierarchy}]` : indicator.calendar
      }
      projectService.newIndicator({...indicator, visible: true} as Indicator)

      setTimeout(async () => {
        await router.navigate(['indicators', indicator.code], {
          relativeTo: route
        })
      })

      return 'Created Indicator!'
    }
  })

  return createIndicatorTool
}


export function injectReviseFormulaTool() {
  const logger = inject(NGXLogger)
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const projectService = inject(ProjectService)

  const reviseFormulaTool = new DynamicStructuredTool({
    name: 'reviseFormula',
    description: 'Revise formula of the indicator.',
    schema: IndicatorFormulaSchema,
    func: async ({code, formula}) => {
      logger.debug(`Execute copilot action 'reviseFormula': code:`, code, `formula:`, formula)

      projectService.updateIndicator({code, formula})

      setTimeout(async () => {
        await router.navigate(['indicators', code], {
          relativeTo: route
        })
      })

      return 'Revised formula of indicator!'
    }
  })

  return reviseFormulaTool
}

export function injectPickCubeTool() {
  const logger = inject(NGXLogger)
  const projectService = inject(ProjectService)
  const dsCoreService = inject(NgmDSCoreService)
  const _dialog = inject(MatDialog)

  const pickCubeTool = new DynamicStructuredTool({
    name: 'pickCube',
    description: 'Pick a cube.',
    schema: z.object({}),
    func: async () => {
      logger.debug(`Execute copilot action 'pickCube'`)

      const dataSources = projectService.dataSources()
      const result = await firstValueFrom<EntitySelectResultType>(
        _dialog
          .open<NgmEntityDialogComponent, EntitySelectDataType, EntitySelectResultType>(NgmEntityDialogComponent, {
            data: {
              dataSources,
              dsCoreService: dsCoreService,
              registerModel: projectService.registerModel.bind(projectService)
            }
          })
          .afterClosed()
      )

      const cube = result?.entities[0]
      if (result?.dataSource && cube) {
        const entityType = await firstValueFrom(projectService.selectEntityType(result.dataSource, cube))
        return `Use model id: '${result.modelId}' and cube: '${cube}'\n` + markdownEntityType(entityType)

        // this.currentDataSource.set(this.models().find((item) => item.key === result.dataSource)?.id)
        // const entitySet = await firstValueFrom(
        //   this.dsCoreService.selectEntitySet(result.dataSource, result.entities[0])
        // )
        // if (isEntitySet(entitySet)) {
        //   this.currentEntityType.set(entitySet.entityType)
        //   return {
        //     dataSource: result.dataSource,
        //     entityType: entitySet.entityType
        //   }
        // }
      }

      return ''
    }
  })

  return pickCubeTool
}
