import { IBasePerTenantEntityModel } from '../base-entity.model'
import { IUser } from '../user.model'

export interface ICertification extends IBasePerTenantEntityModel {
  name?: string
  description?: string
  /**
   * Certification owner
   */
  owner?: IUser
  ownerId?: string
}
