import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { ITag } from '../tag-entity.model'
import { IUser } from '../user.model'
import { ApprovalPolicyTypesStringEnum, IApprovalPolicy } from './approval-policy.model'
import { IIndicator } from './indicator'
import { IPermissionApprovalUser } from './permission-approval-user.model'

export interface IPermissionApproval extends IBasePerTenantAndOrganizationEntityModel {
  status: number
  // createdBy: string;
  createdByName: string
  min_count: number
  permissionId: string
  permissionType: ApprovalPolicyTypesStringEnum
  approvalPolicy: IApprovalPolicy
  approvalPolicyId: string
  indicator: IIndicator
  indicatorId: string
  userApprovals?: IPermissionApprovalUser[]
  // employeeApprovals?: IPermissionApprovalEmployee[];
  // teamApprovals?: IPermissionApprovalTeam[];
  tags?: ITag[]
  // employees?: IEmployee[];
  // teams?: IOrganizationTeam[];
}

export interface IPermissionApprovalCreateInput extends IBasePerTenantAndOrganizationEntityModel {
  id?: string
  userApprovals?: IPermissionApprovalUser[]
  users?: IUser[]
  permissionType?: ApprovalPolicyTypesStringEnum
  permissionId?: string
  indicatorId?: string
  status?: number
  approvalPolicyId?: string
  tags?: ITag[]
}

export enum PermissionApprovalStatusTypesEnum {
  REQUESTED = 1,
  APPROVED = 2,
  REFUSED = 3
}

export const PermissionApprovalStatus = {
  REQUESTED: 1,
  APPROVED: 2,
  REFUSED: 3
}

export interface IPermissionApprovalFindInput extends IBasePerTenantAndOrganizationEntityModel {
  id?: string
}

export interface IApprovalsData {
  icon: string
  title: string
}
