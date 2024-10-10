import { IXpertRole } from '@metad/contracts'
import { IRoleConnectionViewModel } from './connection'
import { IRoleViewModel } from './role'

export interface IStudioModel {
  team: IXpertRole
  roles: IRoleViewModel[]
  connections: IRoleConnectionViewModel[]
}
