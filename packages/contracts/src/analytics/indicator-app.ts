import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

export interface IIndicatorApp extends IBasePerTenantAndOrganizationEntityModel {
  options?: {
    favorites?: string[],
    order?: string[],
  }
}