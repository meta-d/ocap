import { IPoint } from '@foblex/2d'
import { IKnowledgebase, IXpertRole } from 'apps/cloud/src/app/@core'
import { TNodeType } from '../types'

export type TNodeViewModel = {
  key: string
  type: TNodeType
  position: IPoint
} & ({
  type: 'role'
  entity: IXpertRole
} | {
  type: 'knowledge'
  entity: IKnowledgebase
})
