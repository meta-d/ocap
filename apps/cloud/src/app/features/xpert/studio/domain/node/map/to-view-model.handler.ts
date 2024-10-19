import { IHandler } from '@foblex/mediator'
import { IXpert, IXpertRole, TXpertTeamNode } from 'apps/cloud/src/app/@core'

export class ToNodeViewModelHandler implements IHandler<void, TXpertTeamNode[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamNode[] {
    return createXpertNodes(this.team)
  }
}

function createXpertNodes(xpert: IXpert) {
  const nodes: TXpertTeamNode[] = []
  nodes.push(...[xpert.agent, ...(xpert.agents ?? [])].map((_) => {
    return {
      type: 'agent',
      key: _.key,
      position: xpert.options?.agent?.[_.key]?.position,
      entity: _
    } as TXpertTeamNode
  }))

  xpert.executors?.forEach((executor) => {
    nodes.push({
      type: 'xpert',
      key: executor.id,
      position: xpert.options?.xpert?.[executor.id]?.position,
      size: xpert.options?.xpert?.[executor.id]?.size,
      entity: executor,
      nodes: createXpertNodes(executor)
    } as TXpertTeamNode)
  })

  // knowledgebases
  nodes.push(...(xpert.knowledgebases ?? []).map((x) => {
    return {
      key: x.id,
      type: 'knowledge',
      position: xpert.options?.knowledge?.[x.id]?.position,
      entity: x,
    } as TXpertTeamNode
  }))

  // Toolsets
  nodes.push(...(xpert.toolsets ?? []).map((x) => {
    return {
      key: x.id,
      type: 'toolset',
      position: xpert.options?.toolset?.[x.id]?.position,
      entity: x,
    } as TXpertTeamNode
  }))

  return nodes
}