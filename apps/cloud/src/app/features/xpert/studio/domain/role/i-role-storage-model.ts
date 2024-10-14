import { IPoint } from '@foblex/2d'
import { IXpertRole } from 'apps/cloud/src/app/@core'

export interface IRoleStorageModel extends IXpertRole {
  parentId?: string
}