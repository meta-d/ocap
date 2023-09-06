import { IBasePerTenantEntityModel } from '../base-entity.model'
import { ITag } from '../tag-entity.model'
import { IBusinessArea } from './business-area'
import { ISemanticModel } from './semantic-model'

export interface IInsightModel extends IBasePerTenantEntityModel {
  name?: string
  
  entity?: string

  options?: Record<string, unknown>

  modelId?: string
  model?: ISemanticModel

  businessAreaId?: string
  businessArea?: IBusinessArea
  tags?: ITag[]
}
