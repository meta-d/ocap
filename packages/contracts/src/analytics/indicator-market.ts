

import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'


export interface IIndicatorMarket extends IBasePerTenantAndOrganizationEntityModel {
    options?: Record<string, unknown>
}
