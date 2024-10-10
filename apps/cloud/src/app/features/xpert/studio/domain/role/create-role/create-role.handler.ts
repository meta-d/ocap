import { IHandler } from '@foblex/mediator'
import { uuid } from 'apps/cloud/src/app/@core'
import { IStudioStorage } from '../../studio.storage'
import { CreateRoleRequest } from './create-role.request'

export class CreateRoleHandler implements IHandler<CreateRoleRequest> {
  constructor(private storage: IStudioStorage) {}

  public handle(request: CreateRoleRequest): void {
    this.storage.roles.push({
      key: uuid(),
      name: uuid(),
      options: {
        position: request.position
      }
    })
  }
}
