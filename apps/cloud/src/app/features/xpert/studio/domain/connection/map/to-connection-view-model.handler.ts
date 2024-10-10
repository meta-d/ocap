import { IHandler } from '@foblex/mediator'
import { IRoleConnectionStorageModel } from '../i-role-connection-storage-model'
import { IRoleConnectionViewModel } from '../i-role-connection-view-model'

export class ToConnectionViewModelHandler implements IHandler<void, IRoleConnectionViewModel[]> {
  constructor(private connections: IRoleConnectionStorageModel[]) {}

  public handle(): IRoleConnectionViewModel[] {
    return this.connections.map((x) => {
      return {
        ...x
      }
    })
  }
}
