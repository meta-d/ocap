import { IPoint } from '@foblex/2d'
import { IXpertRole } from '@metad/contracts'

export interface IRoleStorageModel extends IXpertRole {
  parentId?: string
}