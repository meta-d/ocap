import { IPoint } from '@foblex/2d';

export class MoveRoleRequest {

  constructor(
    public readonly key: string,
    public readonly position: IPoint,
  ) {
  }
}
