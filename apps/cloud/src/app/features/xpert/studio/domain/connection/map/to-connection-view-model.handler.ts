import { IHandler } from '@foblex/mediator'
import { IXpertRole, TXpertTeamConnection } from '../../../../../../@core/types'

export class ToConnectionViewModelHandler implements IHandler<void, TXpertTeamConnection[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamConnection[] {
    return handleConntections(this.team)
  }
}

function handleConntections(xpert: IXpertRole) {
  const connections: TXpertTeamConnection[] = []
  xpert.knowledgebases?.forEach((_) => {
    const from = xpert.agent.key
    const to = _.id
    connections.push({
      type: 'knowledge',
      key: from + '/' + to,
      from,
      to
    })
  })
  xpert.toolsets?.forEach((_) => {
    const from = xpert.agent.key
    const to = _.id
    connections.push({
      type: 'toolset',
      key: from + '/' + to,
      from,
      to
    })
  })

  for (const agent of xpert.agents ?? []) {
    const from = agent.leaderKey
    const to = agent.key
    if (from && to) {
      connections.push({
        type: 'agent',
        key: from + '/' + to,
        from,
        to
      })
    }
  }

  return connections
}
