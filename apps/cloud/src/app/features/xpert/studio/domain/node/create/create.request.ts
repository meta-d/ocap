import { IPoint } from '@foblex/2d'
import { TNodeType } from '../../types'

export class CreateNodeRequest {
  constructor(
    public readonly type: TNodeType,
    public readonly position: IPoint
  ) {}
}
