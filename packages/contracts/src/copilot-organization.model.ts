import { AiProvider } from './ai.model'
import { IBasePerTenantEntityModel } from './base-entity.model'
import { IOrganization } from './organization.model'

/**
 * 
 */
export interface ICopilotOrganization extends IBasePerTenantEntityModel {
  organizationId?: string
  organization?: IOrganization
  // 关联的ai服务提供商
  provider?: AiProvider
  // 当前期间token限制数量
  tokenLimit?: number
  // 当前期间内使用的token
  tokenUsed?: number
  // 历史使用token总数
  tokenTotalUsed?: number
}
