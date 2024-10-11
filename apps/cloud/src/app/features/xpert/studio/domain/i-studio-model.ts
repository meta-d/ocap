import { IXpertRole } from '@metad/contracts'
import { IRoleConnectionViewModel } from './connection'
import { IRoleViewModel } from './role'
import { IKnowledgebaseViewModel } from './knowledge'

export interface IStudioModel {
  team: IXpertRole
  roles: IRoleViewModel[]
  knowledges: IKnowledgebaseViewModel[]
  connections: IRoleConnectionViewModel[]
}
