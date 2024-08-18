import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { ISemanticModel } from './semantic-model'

export interface IChatBIModel extends IBasePerTenantAndOrganizationEntityModel {
  modelId: string
  model?: ISemanticModel
  entity: string
  entityCaption?: string
  entityDescription?: string
  visits?: number
  options?: ChatBIModelOptions
}

export type ChatBIModelOptions = {
  suggestions: string[]
}
