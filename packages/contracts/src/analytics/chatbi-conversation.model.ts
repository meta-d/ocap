import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

export interface IChatBIConversation extends IBasePerTenantAndOrganizationEntityModel {
  key: string
  name?: string
  modelId?: string
  entity?: string
  command?: string
  options?: {
    messages: any[]
  }
}
