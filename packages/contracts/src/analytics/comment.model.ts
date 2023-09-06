import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IIndicator } from './indicator'


export interface IComment extends IBasePerTenantAndOrganizationEntityModel {
  content?: string
  parentId?: string
  level?: number

  options?: any

  indicatorId?: string
  indicator?: IIndicator
}
