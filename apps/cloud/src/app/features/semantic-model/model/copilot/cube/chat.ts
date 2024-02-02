import { uuid } from '@metad/components/core'
import { Cube } from '@metad/ocap-core'
import { SemanticModelService } from '../../model.service'
import { SemanticModelEntityType } from '../../types'

export async function createCube(modelService: SemanticModelService, cube: Cube) {
  const key = uuid()
  const cubeState = {
    type: SemanticModelEntityType.CUBE,
    id: key,
    name: cube.name,
    caption: cube.caption,
    cube: {
      ...cube,
      __id__: key,
      measures: cube.measures?.map((measure) => ({ ...measure, __id__: uuid(), visible: true })),
      dimensions: cube.dimensions?.map((dimension) => ({
        ...dimension,
        __id__: uuid(),
        hierarchies: dimension.hierarchies?.map((hierarchy) => ({
          ...hierarchy,
          __id__: uuid(),
          levels: hierarchy.levels?.map((level) => ({ ...level, __id__: uuid() }))
        }))
      })),
      dimensionUsages: cube.dimensionUsages?.map((dimensionUsage) => ({ ...dimensionUsage, __id__: uuid() }))
    },
    queryLab: {}
  }

  modelService.newEntity(cubeState)
  modelService.activeEntity(cubeState)
}
