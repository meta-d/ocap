import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IIndicator } from './indicator'

export interface IChatBIConversation extends IBasePerTenantAndOrganizationEntityModel {
  key: string
  name?: string
  modelId?: string
  entity?: string
  command?: string
  options?: {
    messages: any[]
    indicators?: IIndicator
    answer?: any
  }
}
