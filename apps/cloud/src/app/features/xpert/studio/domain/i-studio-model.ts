import { IKnowledgebase, IXpertRole } from 'apps/cloud/src/app/@core'
import { IRoleConnectionViewModel } from './connection'
import { IRoleViewModel } from './role'
import { TNodeViewModel } from './node'

export interface IStudioModel {
  team: IXpertRole
  roles: IRoleViewModel[]
  connections: IRoleConnectionViewModel[]
  nodes: TNodeViewModel[]
}
