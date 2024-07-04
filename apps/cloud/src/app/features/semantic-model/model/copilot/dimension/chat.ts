import { uuid } from '@metad/components/core'
import { DimensionType, PropertyDimension, Semantics } from '@metad/ocap-core'
import { SemanticModelService } from '../../model.service'
import { ModelDimensionState, SemanticModelEntityType } from '../../types'

export function createOrEditDimension(modelService: SemanticModelService, dimension: PropertyDimension) {
  const dimensions = modelService.dimensions()
  let key = ''
  const index = dimensions.findIndex((d) => d.name === dimension.name)
  if (index > -1) {
    key = dimensions[index].__id__
  } else {
    key = uuid()
  }
  const _dimension = {
    ...dimension,
    __id__: key,
    hierarchies: dimension.hierarchies?.map((hierarchy, index) => ({
      ...hierarchy,
      name: index ? hierarchy.name : '',
      __id__: uuid(),
      levels: hierarchy.levels?.map((level) => ({ ...level, __id__: uuid() }))
    }))
  } as PropertyDimension

  if (dimension.type === DimensionType.TimeDimension) {
    _dimension.semantics = {
      semantic: Semantics.Calendar
    }
  }

  const dimensionState: ModelDimensionState = {
    type: SemanticModelEntityType.DIMENSION,
    id: key,
    name: dimension.name,
    caption: dimension.caption,
    dimension: _dimension
  }

  modelService.upsertDimension(_dimension)
  // Active the entity if it is new
  if (index === -1) {
    modelService.activeEntity(dimensionState)
  }
}
