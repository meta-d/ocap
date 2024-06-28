import { uuid } from '@metad/components/core'
import { C_MEASURES, Cube, DimensionType, Semantics } from '@metad/ocap-core'
import { SemanticModelService } from '../../model.service'
import { MODEL_TYPE, SemanticModelEntityType } from '../../types'

export async function createOrEditCube(modelService: SemanticModelService, cube: Cube) {
  const isOlap = modelService.modelType() === MODEL_TYPE.OLAP
  const cubes = modelService.cubes()
  const index = cubes.findIndex((c) => c.name === cube.name)
  let key = ''
  if (index > -1) {
    // Edit existing cube
    const _cube = cubes[index]
    key = _cube.__id__
    modelService.updateCube({
      ...cube,
      __id__: _cube.__id__
    })
  } else {
    key = uuid()
    const _cube: Cube = {
      ...cube,
      __id__: key,
      measures: cube.measures?.map((measure) => ({
        ...measure,
        __id__: uuid(),
        visible: true,
        aggregator: measure.aggregator || 'sum'
      })),
      dimensions: cube.dimensions?.map((dimension) => ({
        ...dimension,
        __id__: uuid(),
        // Add semantic 'Calendar' for time dimension
        semantics:
          dimension.semantics ??
          (dimension.type === DimensionType.TimeDimension
            ? {
                semantic: Semantics.Calendar
              }
            : null),
        hierarchies: dimension.hierarchies?.map((hierarchy, index) => ({
          ...hierarchy,
          __id__: uuid(),
          name: index ? hierarchy.name : '',
          hasAll: isOlap,
          levels: hierarchy.levels?.map((level) => ({ ...level, __id__: uuid() }))
        }))
      })),
      dimensionUsages: cube.dimensionUsages?.map((dimensionUsage) => ({ ...dimensionUsage, __id__: uuid() })),
      calculatedMembers: cube.calculatedMembers?.map((calculatedMember) => ({
        ...calculatedMember,
        __id__: uuid(),
        dimension: C_MEASURES,
        visible: true
      }))
    }

    modelService.newCube(_cube)
  }

  modelService.activeEntity({
    type: SemanticModelEntityType.CUBE,
    id: key
  })
}
