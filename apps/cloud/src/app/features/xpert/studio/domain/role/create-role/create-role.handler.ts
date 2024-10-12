import { IHandler } from '@foblex/mediator'
import { uuid, XpertRoleTypeEnum } from 'apps/cloud/src/app/@core'
import { CreateRoleRequest } from './create-role.request'

export class CreateRoleHandler implements IHandler<CreateRoleRequest> {
  constructor() {}

  public handle(request: CreateRoleRequest): void {
    // this.storage.roles.push({
    //   type: XpertRoleTypeEnum.Agent,
    //   key: uuid(),
    //   name: null,
    //   title: uuid(),
    //   options: {
    //     position: request.position
    //   }
    // })
  }
}
