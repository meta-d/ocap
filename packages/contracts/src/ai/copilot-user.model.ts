import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IOrganization } from '../organization.model'
import { IUser } from '../user.model'
import { AiProvider } from './ai.model'

/**
 * 
 */
export interface ICopilotUser extends IBasePerTenantAndOrganizationEntityModel {
  orgId?: string
  org?: IOrganization
  userId?: string
  user?: IUser
  // 关联的ai服务提供商
  provider?: AiProvider | string
  // 当前期间token限制数量
  tokenLimit?: number
  // 当前期间内使用的token
  tokenUsed?: number
  // 历史使用token总数
  tokenTotalUsed?: number
}
