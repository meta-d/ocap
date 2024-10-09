import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IUser } from '../user.model'

/**
 * Expert Workspace
 */
export interface IXpertWorkspace extends IBasePerTenantAndOrganizationEntityModel {
  name: string
  description?: string

  ownerId: string
  owner?: IUser
  members?: IUser[]

  status: TXpertWorkspaceStatus

  settings?: TXpertWorkspaceSettings
}

export type TXpertWorkspaceSettings = {
  //
}
export type  TXpertWorkspaceStatus = 'active' | 'deprecated' | 'archived'