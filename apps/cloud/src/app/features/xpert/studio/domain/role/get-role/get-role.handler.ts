import { IHandler } from '@foblex/mediator'
import { IXpertRole } from 'apps/cloud/src/app/@core'
import { findXpertRole } from '../../studio.storage'
import { GetRoleRequest } from './get-role.request'

export class GetRoleHandler implements IHandler<GetRoleRequest> {
  // constructor(private storage: IStudioStorage) {}

  public handle(request: GetRoleRequest): IXpertRole {
    // const node = findXpertRole([...this.storage.roles, this.storage.team], request.key)
    // if (!node) {
    //   throw new Error(`Xpert with key ${request.key} not found`)
    // }
    return null
  }
}
