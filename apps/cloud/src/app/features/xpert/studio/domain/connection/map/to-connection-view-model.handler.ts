import { IHandler } from '@foblex/mediator'
import { IXpertRole, TXpertTeamConnection } from '../../../../../../@core/types'

export class ToConnectionViewModelHandler implements IHandler<void, TXpertTeamConnection[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamConnection[] {
    return handleConntections(this.team)
  }
}

function handleConntections(role: IXpertRole) {
  const connections: TXpertTeamConnection[] = []
  role.knowledgebases?.forEach((_) => {
    const from = role.id
    const to = _.id
    connections.push({
      type: 'knowledge',
      key: from + '/' + to,
      from,
      to
    })
  })
  role.toolsets?.forEach((_) => {
    const from = role.id
    const to = _.id
    connections.push({
      type: 'toolset',
      key: from + '/' + to,
      from,
      to
    })
  })

  // for (const member of role.followers ?? []) {
  //   const from = role.id
  //   const to = member.id
  //   connections.push({
  //     type: 'role',
  //     key: from + '/' + to,
  //     from,
  //     to
  //   })

  //   if (member.followers) {
  //     connections.push(...handleConntections(member))
  //   }
  // }
  return connections
}
