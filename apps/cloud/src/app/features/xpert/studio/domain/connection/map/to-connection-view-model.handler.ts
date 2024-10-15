import { IHandler } from '@foblex/mediator'
import { IXpertAgent, IXpertRole, TXpertTeamConnection } from '../../../../../../@core/types'

export class ToConnectionViewModelHandler implements IHandler<void, TXpertTeamConnection[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamConnection[] {
    const xpert = this.team
    const connections: TXpertTeamConnection[] = []

    connections.push(...createAgentConnections(xpert.agent))
    for (const agent of xpert.agents ?? []) {
      connections.push(...createAgentConnections(agent))
    }

    return connections
  }
}

function createAgentConnections(agent: IXpertAgent) {
  const connections = []
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

  // knowledgebases
  agent.knowledgebaseIds?.forEach((knowledgebaseId) => {
    const from = agent.key
    const to = knowledgebaseId
    connections.push({
      type: 'knowledge',
      key: from + '/' + to,
      from,
      to
    })
  })

  // toolsets
  agent.toolsetIds?.forEach((toolsetId) => {
    const from = agent.key
    const to = toolsetId
    connections.push({
      type: 'toolset',
      key: from + '/' + to,
      from,
      to
    })
  })

  return connections
}