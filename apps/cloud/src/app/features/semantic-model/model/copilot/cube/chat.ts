import { uuid } from '@metad/components/core'
import { Cube } from '@metad/ocap-core'
import { SemanticModelService } from '../../model.service'
import { MODEL_TYPE, SemanticModelEntityType } from '../../types'

export async function createCube(modelService: SemanticModelService, cube: Cube) {
  const isOlap = modelService.modelType() === MODEL_TYPE.OLAP
  const key = uuid()
  const cube2 = {
    ...cube,
    __id__: key,
    measures: cube.measures?.map((measure) => ({ ...measure, __id__: uuid(), visible: true, aggregator: measure.aggregator || 'sum'})),
    dimensions: cube.dimensions?.map((dimension) => ({
      ...dimension,
      __id__: uuid(),
      hierarchies: dimension.hierarchies?.map((hierarchy) => ({
        ...hierarchy,
        __id__: uuid(),
        hasAll: isOlap,
        levels: hierarchy.levels?.map((level) => ({ ...level, __id__: uuid() }))
      }))
    })),
    dimensionUsages: cube.dimensionUsages?.map((dimensionUsage) => ({ ...dimensionUsage, __id__: uuid() }))
  }
  const cubeState = {
    type: SemanticModelEntityType.CUBE,
    id: key,
    name: cube.name,
    caption: cube.caption,
    cube: cube2,
    queryLab: {}
  }

  modelService.newCube(cube2)
  modelService.activeEntity(cubeState)
}
