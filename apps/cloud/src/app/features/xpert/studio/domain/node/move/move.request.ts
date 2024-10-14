import { IRect } from 'apps/cloud/src/app/@core'

export class MoveNodeRequest {
  constructor(
    public readonly key: string,
    public readonly position: IRect
  ) {}
}
