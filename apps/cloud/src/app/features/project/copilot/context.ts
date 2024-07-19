import { inject } from '@angular/core'
import { NgmCopilotContextToken } from '@metad/copilot-angular'
import { markdownEntityType } from '@metad/core'
import { firstValueFrom, map, shareReplay } from 'rxjs'
import { ProjectService } from '../project.service'
import { isIndicatorMeasureProperty } from '@metad/ocap-core'

export function provideCopilotCubes() {
  const projectService = inject(ProjectService)
  const copilotContext = inject(NgmCopilotContextToken)

  const copilotCubes$ = projectService.modelCubes$.pipe(
    map((models) => {
      const items = []
      models.forEach((model, index) => {
        items.push(
          ...model.cubes.map((cube) => ({
            value: {
              dataSource: model,
              dataSourceId: model.id,
              serizalize: async () => {
                const entityType = await firstValueFrom(projectService.selectEntityType(model.key, cube.name))
                if (entityType) {

                }
                return `The model id: '${model.id}'\n` + markdownEntityType({
                  ...entityType, 
                  // Filter excludes indicators
                  properties: Object.keys(entityType.properties)
                    .filter((key) => !isIndicatorMeasureProperty(entityType.properties[key]))
                    .reduce((properties, key) => {
                      properties[key] = entityType.properties[key]
                      return properties
                    }, {})
                })
              }
            },
            key: cube.name,
            caption: cube.caption
          }))
        )
      })
      return items
    }),
    shareReplay(1)
  )

  copilotContext.cubes.update(() => copilotCubes$)

  return copilotContext
}
