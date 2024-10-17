import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'
import { TAvatar } from './types'
import { IPoint, IXpert } from './xpert.model'
import { ICopilotModel } from './copilot-model.model'

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

  // Many to one
  xpert?: IXpert
  xpertId?: string
  copilotModel?: ICopilotModel
  copilotModelId?: string

  teamId?: string
  team?: IXpert

  leader?: IXpertAgent
  leaderKey?: string
  followers?: IXpertAgent[]

  // Many to many
  collaborators?: IXpert[]
  collaboratorNames?: string[]
  toolsets?: IXpertToolset[]
  toolsetIds?: string[]
  knowledgebases?: IKnowledgebase[]
  knowledgebaseIds?: string[]
}

export type TXpertAgentOptions = {
  //
}