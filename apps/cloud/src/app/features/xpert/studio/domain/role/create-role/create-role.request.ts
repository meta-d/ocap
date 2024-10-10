import { IPoint } from '@foblex/2d';

export class CreateRoleRequest {

  constructor(
    public readonly position: IPoint,
  ) {
  }
}
