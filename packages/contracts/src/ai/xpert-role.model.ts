import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'

/**
 * Expert role, business role for the xperts.
 */
export interface IXpertRole extends IBasePerTenantAndOrganizationEntityModel {
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

  toolsets?: IXpertToolset[]
  /**
   * More configuration
   */
  options?: TXpertRoleOptions

  // Many to many relationship
  knowledgebases?: IKnowledgebase[]
}

export type TXpertRoleOptions = {
  context?: Record<string, any>
  toolsets: {
    [id: string]: {
      [tool: string]: {
        defaultArgs: Record<string, any>
      }
    }
  }
}