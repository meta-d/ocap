import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IUser } from '../user.model'
import { IKnowledgebase } from './knowledgebase.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IXpertWorkspace } from './xpert-workspace.model'

/**
 * Expert role, business role for the xperts.
 */
export interface IXpertRole extends IBasePerTenantAndOrganizationEntityModel {
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
   * Publish date of latest
   */
  publishAt?: Date
  /**
   * 当前版本上的草稿
   */
  draft?: TXpertTeamDraft

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
   * Leader: Team Leader
   */
  leader?: IXpertRole
  /**
   * 下属员工
   */
  // members?: IXpertRole[]

  /**
   * More configuration
   */
  options?: TXpertRoleOptions

  // Many to many relationship
  /**
   * Followers: people who carry out the decisions made by the leader
   */
  followers?: IXpertRole[]
  /**
   * 所使用的工具集
   */
  toolsets?: IXpertToolset[]
  /**
   * Knowledge base with permission to search
   */
  knowledgebases?: IKnowledgebase[]
  /**
   * The corresponding person in charge, whose has the authority to execute this digital expert
   */
  managers?: IUser[]
}

export type TXpertRoleOptions = {
  position?: {
    x: number
    y: number
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

export enum XpertRoleTypeEnum {
  Agent = 'agent',
  Copilot = 'copilot'
}

// Xpert team draft types

export type TXpertTeamDraft = {
  team: IXpertRole

  savedAt?: Date
  nodes: TXpertTeamNode[]
  connections: TXpertTeamConnection[]
  teams?: TXpertTeamGroup[]
}

export type TXpertTeamNodeType = 'role' | 'knowledge' | 'toolset'

export type TXpertTeamNode = {
  key: string
  type: TXpertTeamNodeType
  position: IRect
  hash?: string
} & (
  | {
      type: 'role'
      entity: IXpertRole
    }
  | {
      type: 'knowledge'
      entity: IKnowledgebase
    }
    | {
      type: 'toolset'
      entity: IXpertToolset
    }
)

export interface IPoint {
  x: number
  y: number
}

export interface ISize {
  width: number;
  height: number;
}


export interface IRect extends IPoint, Partial<ISize> {
  gravityCenter?: IPoint;
}

export type TXpertTeamGroup = {
  id: string
  title: string
  position: IPoint
  size?: ISize
  parentId?: string
  team: IXpertRole
  // nodes: TXpertTeamNode[]
  // connections: TXpertTeamConnection[]
  // teams?: TXpertTeamGroup[]
}

export interface TXpertTeamConnection {
  key: string
  from: string
  to: string
  type: TXpertTeamNodeType
}
