import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'
import { IXpertWorkspace } from './xpert-workspace.model'

/**
 * Expert role, business role for the xperts.
 */
export interface IXpertRole extends IBasePerTenantAndOrganizationEntityModel {
  /**
   * Semantic Primary Key
   */
  key: string
  name: string
  title?: string
  titleCN?: string
  description?: string
  type: XpertRoleTypeEnum
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
  /**
   * Version of role: '1' '2' '2.1' '2.2'...
   */
  version?: string
  /**
   * Is latest version
   */
  latest?: boolean
  /**
   * 当前版本上的草稿
   */
  draft?: TXpertRoleDraft

  /**
   * 所属的工作空间
   */
  workspaceId?: string
  workspace?: IXpertWorkspace

  /**
   * @deprecated use teamId instand
   */
  teamRoleId?: string
  /**
   * @deprecated use team instand
   */
  teamRole?: IXpertRole
  /**
   * 下属员工
   */
  members?: IXpertRole[]
  /**
   * 所使用的工具集
   */
  toolsets?: IXpertToolset[]
  /**
   * More configuration
   */
  options?: TXpertRoleOptions

  // Many to many relationship
  /**
   * 有权限检索的知识库
   */
  knowledgebases?: IKnowledgebase[]
}

export type TXpertRoleOptions = {
  position?: {
    x: number;
    y: number;
}
  context?: Record<string, any>
  toolsets?: {
    [id: string]: {
      [tool: string]: {
        defaultArgs: Record<string, any>
      }
    }
  }
}

export type TXpertRoleDraft = {
  team: IXpertRole
  roles: IXpertRole[]
}

export enum XpertRoleTypeEnum {
  Agent = 'agent',
  Copilot = 'copilot'
}
