import { IXpert } from '../ai'
import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IIntegration } from '../integration.model'
import { ISemanticModel } from './semantic-model'

export interface IChatBIModel extends IBasePerTenantAndOrganizationEntityModel {
  modelId: string
  model?: ISemanticModel
  entity: string
  entityCaption?: string
  entityDescription?: string
  visits?: number
  options?: ChatBIModelOptions

  // ManyToMany
  xperts?: IXpert[]
  integrations?: IIntegration[]
}

export type ChatBIModelOptions = {
  suggestions: string[]
}
