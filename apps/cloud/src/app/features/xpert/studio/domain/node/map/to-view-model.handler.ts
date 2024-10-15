import { IHandler } from '@foblex/mediator'
import { IXpertRole, TXpertTeamNode } from 'apps/cloud/src/app/@core'


export class ToNodeViewModelHandler implements IHandler<void, TXpertTeamNode[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamNode[] {
    const nodes: TXpertTeamNode[] = []

    nodes.push(...[this.team.agent, ...this.team.agents].map((_) => {
      return {
        type: 'agent',
        key: _.key,
        position: this.team.options?.agent?.[_.key]?.position,
        entity: _
      } as TXpertTeamNode
    }))

    // knowledgebases
    nodes.push(...(this.team.knowledgebases ?? []).map((x) => {
      return {
        key: x.id,
        type: 'knowledge',
        position: this.team.options?.knowledge?.[x.id]?.position,
        entity: x,
      } as TXpertTeamNode
    }))

    // Toolsets
    nodes.push(...(this.team.toolsets ?? []).map((x) => {
      return {
        key: x.id,
        type: 'toolset',
        position: this.team.options?.toolset?.[x.id]?.position,
        entity: x,
      } as TXpertTeamNode
    }))

    return nodes
  }
}
