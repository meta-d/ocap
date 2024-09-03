import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'
import { ICopilotToolset } from './copilot-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'

/**
 * Copilot role, business role for the copilot
 */
export interface ICopilotRole extends IBasePerTenantAndOrganizationEntityModel {
  name: string
  title?: string
  titleCN?: string
  description?: string
  active?: boolean
  avatar?: string

  toolsets?: ICopilotToolset[]

  // Many to many relationship
  knowledgebases?: IKnowledgebase[]
}
