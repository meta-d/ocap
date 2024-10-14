import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'
import { TAvatar } from './types'
import { IXpert } from './xpert.model'

/**
 * Expert agent, ai agent for the xperts.
 */
export interface IXpertAgent extends IBasePerTenantAndOrganizationEntityModel {
  key: string
  name?: string
  title?: string
  description?: string
  avatar?: TAvatar
  /**
   * 系统提示语
   */
  prompt?: string
  
  /**
   * More configuration
   */
  options?: TXpertAgentOptions

  // Many to many relationship
  toolsets?: IXpertToolset[]
  knowledgebases?: IKnowledgebase[]

  // Many to one
  xpertId?: string
  xpert?: IXpert

  leader?: IXpertAgent
  leaderKey?: string
}

export type TXpertAgentOptions = {
  //
}