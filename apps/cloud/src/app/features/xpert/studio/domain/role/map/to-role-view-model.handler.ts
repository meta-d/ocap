import { IHandler } from '@foblex/mediator'
import { IRoleViewModel } from '../i-role-view-model'
import { IRoleStorageModel } from '../i-role-storage-model'

export class ToRoleViewModelHandler implements IHandler<void, IRoleViewModel[]> {
  constructor(private roles: IRoleStorageModel[]) {}

  public handle(): IRoleViewModel[] {
    return this.roles.map((x) => {
      return {
        ...x,
        key: x.key ?? x.id,
        position: x.options?.position
      }
    })
  }
}
