import { IHandler } from '@foblex/mediator';
import { MoveRoleRequest } from './move-role.request';
import { findXpertRole, IStudioStorage } from '../../studio.storage';

export class MoveRoleHandler implements IHandler<MoveRoleRequest> {

  constructor(
    private storage: IStudioStorage
  ) {
  }

  public handle(request: MoveRoleRequest): void {
    const node = findXpertRole([...this.storage.roles, this.storage.team], request.key)
    if (!node) {
      throw new Error(`Xpert with key ${ request.key } not found`);
    }
    node.options ??= {}
    node.options.position = request.position;
  }
}
