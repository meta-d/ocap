import { IPoint } from '@foblex/2d'
import { IKnowledgebase } from '@metad/contracts'

export interface IKnowledgebaseStorageModel extends IKnowledgebase {
  position: IPoint
}