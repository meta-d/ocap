import { IHandler } from '@foblex/mediator'
import { assign } from 'lodash-es'
import { findXpertRole, IStudioStorage } from '../../studio.storage'
import { UpdateRoleRequest } from './update-role.request'

export class UpdateRoleHandler implements IHandler<UpdateRoleRequest> {
  constructor(private storage: IStudioStorage) {}

  public handle(request: UpdateRoleRequest): void {
    const node = findXpertRole([...this.storage.roles, this.storage.team], request.key)
    if (!node) {
      throw new Error(`Xpert with key ${request.key} not found`)
    }
    assign(node, request.entity)
  }
}
