import { IPoint } from '@foblex/2d'

export class MoveNodeRequest {
  constructor(
    public readonly key: string,
    public readonly position: IPoint
  ) {}
}
