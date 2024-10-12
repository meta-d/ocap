import { IHandler } from '@foblex/mediator'
import { IXpertRole, TXpertTeamNode } from 'apps/cloud/src/app/@core'
import { uniqBy } from 'lodash-es'


export class ToNodeViewModelHandler implements IHandler<void, TXpertTeamNode[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamNode[] {
    const nodes = []

    nodes.push(...[this.team, ...handleRoles(this.team)].map((x) => {
      return {
        type: 'role',
        key: x.id,
        position: x.position,
        entity: x,
      }
    }))

    // knowledgebases
    const knowledgebases = [...(this.team.knowledgebases ?? [])]
    knowledgebases.push(...handleKnowledgebases(this.team))

    return nodes.concat(...uniqBy(knowledgebases, 'id').map((x) => {
      return {
        key: x.id,
        type: 'knowledge',
        position: null,
        entity: x,
      }
    }))
  }
}

function handleRoles(role: IXpertRole) {
  const roles = []
  for (const member of role.members ?? []) {
    roles.push(member)
    if (member.members) {
      roles.push(...handleRoles(member))
    }
  }
  return roles
}

function handleKnowledgebases(role: IXpertRole) {
  const items = []
  for (const member of role.members ?? []) {
    items.push(...(member.knowledgebases ?? []))
    if (member.members) {
      items.push(...handleKnowledgebases(member))
    }
  }
  return items
}
