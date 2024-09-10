import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
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
  /**
   * 系统提示语
   */
  prompt?: string
  /**
   * 对话开场白
   */
  starters?: string[]
  active?: boolean
  avatar?: string

  toolsets?: ICopilotToolset[]
  /**
   * More configuration
   */
  options?: TCopilotRoleOptions

  // Many to many relationship
  knowledgebases?: IKnowledgebase[]
}

export type TCopilotRoleOptions = {
  toolsets: {
    [id: string]: {
      [tool: string]: {
        defaultArgs: Record<string, any>
      }
    }
  }
}