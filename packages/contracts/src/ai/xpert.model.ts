import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IXpertToolset } from './xpert-toolset.model'
import { IKnowledgebase } from './knowledgebase.model'
import { TAvatar } from './types'
import { IXpertWorkspace } from './xpert-workspace.model'
import { IUser } from '../user.model'
import { IXpertAgent } from './xpert-agent.model'

/**
 * Digital Expert
 */
export interface IXpert extends IBasePerTenantAndOrganizationEntityModel {
  slug: string
  name: string
  type: XpertTypeEnum
  title?: string
  titleCN?: string
  description?: string

  active?: boolean
  avatar?: TAvatar

  /**
   * 对话开场白
   */
  starters?: string[]
  
  /**
   * More configuration
   */
  options?: TXpertOptions

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

  deletedAt?: Date

  agent?: IXpertAgent
  
  // Many to one
  /**
   * 所属的工作空间
   */
  workspaceId?: string
  workspace?: IXpertWorkspace

  // One to many
  agents?: IXpertAgent[]

  // Many to many relationships

  /**
   * 子专家, 执行具体任务的 Digital Expert, 专注于完成被分配的工作
   */
  executors?: IXpert[]
  /**
   * 调用此专家的任务协调者
   */
  leaders?: IXpert[]
  
  knowledgebases?: IKnowledgebase[]
  toolsets?: IXpertToolset[]

  /**
   * The corresponding person in charge, whose has the authority to execute this digital expert
   */
  managers?: IUser[]
}

export type TXpertOptions = {
  //
}

export enum XpertTypeEnum {
  Agent = 'agent',
  Copilot = 'copilot'
}

// Xpert team draft types

export type TXpertTeamDraft = {
  team: IXpert

  savedAt?: Date
  nodes: TXpertTeamNode[]
  connections: TXpertTeamConnection[]
  teams?: TXpertTeamGroup[]
}


export type TXpertTeamNodeType = 'agent' | 'knowledge' | 'toolset'

export type TXpertTeamNode = {
  key: string
  type: TXpertTeamNodeType
  position: IRect
  hash?: string
} & (
  | {
      type: 'agent'
      entity: IXpertAgent
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
  team: IXpert
  agent?: IXpertAgent
}

export interface TXpertTeamConnection {
  key: string
  from: string
  to: string
  type: TXpertTeamNodeType
}
