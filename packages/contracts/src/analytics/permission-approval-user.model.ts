import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IUser } from '../user.model'
import { IPermissionApproval } from './permission-approval.model'

export interface IPermissionApprovalUser extends IBasePerTenantAndOrganizationEntityModel {
  permissionApprovalId: string
  userId: string
  status: number
  
  permissionApproval: IPermissionApproval
  user: IUser
}
