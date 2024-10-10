import { IHandler } from '@foblex/mediator'
import { IXpertRole } from '../../../../../../@core/types'
import { IStudioStorage } from '../../studio.storage'
import { getXpertRoleKey } from '../../types'
import { IRoleConnectionViewModel } from '../i-role-connection-view-model'

export class ToConnectionViewModelHandler implements IHandler<void, IRoleConnectionViewModel[]> {
  constructor(private storage: IStudioStorage) {}

  public handle(): IRoleConnectionViewModel[] {
    return handleConntections(this.storage.team)
  }
}

function handleConntections(role: IXpertRole) {
  const connections = []
  for (const member of role.members ?? []) {
    const from = getXpertRoleKey(role)
    const to = getXpertRoleKey(member)
    connections.push({
      key: from + '/' + to,
      from,
      to
    })
    if (member.members) {
      connections.push(...handleConntections(member))
    }
  }
  return connections
}
