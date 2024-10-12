import { IPoint } from '@foblex/2d'
import { TNodeViewModel } from '../i-view-model'

export class MoveNodeRequest {
  constructor(
    public readonly node: TNodeViewModel,
    public readonly position: IPoint
  ) {}
}
