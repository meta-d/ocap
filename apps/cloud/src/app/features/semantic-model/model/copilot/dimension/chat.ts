import { uuid } from '@metad/components/core'
import { PropertyDimension } from '@metad/ocap-core'
import { SemanticModelService } from '../../model.service'
import { ModelDimensionState, SemanticModelEntityType } from '../../types'

export function createDimension(modelService: SemanticModelService, dimension: PropertyDimension) {
  const key = uuid()
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
  
  const dimensionState: ModelDimensionState = {
    type: SemanticModelEntityType.DIMENSION,
    id: key,
    name: dimension.name,
    caption: dimension.caption,
    dimension: _dimension
  }

  modelService.newDimension(_dimension)
  modelService.activeEntity(dimensionState)
}
