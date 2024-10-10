import { IHandler } from '@foblex/mediator'
import { IStudioStorage, removeXpertRole } from '../../studio.storage'
import { RemoveRoleRequest } from './remove-role.request'

export class RemoveRoleHandler implements IHandler<RemoveRoleRequest> {
  constructor(private storage: IStudioStorage) {}

  public handle(request: RemoveRoleRequest): void {
    this.storage.roles = removeXpertRole(this.storage.roles, request.roleKey)
    this.storage.team.members = removeXpertRole(this.storage.team.members, request.roleKey)
  }
}
