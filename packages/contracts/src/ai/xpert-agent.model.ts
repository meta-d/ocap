import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'

/**
 * Expert agent, ai agent for the xperts.
 */
export interface IXpertAgent extends IBasePerTenantAndOrganizationEntityModel {
  name: string
  title?: string
  titleCN?: string
  description?: string
  /**
   * 系统提示语
   */
  prompt?: string

  active?: boolean
  avatar?: string

  toolsets?: IXpertToolset[]
  /**
   * More configuration
   */
  options?: TXpertAgentOptions

  // Many to many relationship
  knowledgebases?: IKnowledgebase[]
}

export type TXpertAgentOptions = {
  //
}