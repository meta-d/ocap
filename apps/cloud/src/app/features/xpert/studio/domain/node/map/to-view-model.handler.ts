import { IHandler } from '@foblex/mediator'
import { IXpertRole, TXpertTeamNode, TXpertTeamNodeType } from 'apps/cloud/src/app/@core'
import { uniqBy } from 'lodash-es'


export class ToNodeViewModelHandler implements IHandler<void, TXpertTeamNode[]> {
  constructor(private team: IXpertRole) {}

  public handle(): TXpertTeamNode[] {
    const nodes: TXpertTeamNode[] = []

    nodes.push(...[this.team.agent, ...this.team.agents].map((_) => {
      return {
        type: 'agent',
        key: _.key,
        position: _.options?.position,
        entity: _
      } as TXpertTeamNode
    }))

    // nodes.push(...[this.team, ...handleRoles(this.team)].map((x) => {
    //   return {
    //     type: 'role',
    //     key: x.id,
    //     position: x.position,
    //     entity: x,
    //   }
    // }))

    // // knowledgebases
    // const knowledgebases = [...(this.team.knowledgebases ?? [])]
    // knowledgebases.push(...handleKnowledgebases(this.team))
    // nodes.push(...uniqBy(knowledgebases, 'id').map((x) => {
    //   return {
    //     key: x.id,
    //     type: 'knowledge',
    //     position: null,
    //     entity: x,
    //   }
    // }))

    // // Toolsets
    // const toolsets = [...(this.team.toolsets ?? [])]
    // toolsets.push(...handleToolsets(this.team))
    // nodes.push(...uniqBy(toolsets, 'id').map((x) => {
    //   return {
    //     key: x.id,
    //     type: 'toolset',
    //     position: null,
    //     entity: x,
    //   }
    // }))

    return nodes
  }
}

// function handleRoles(role: IXpertRole) {
//   const roles = []
//   for (const member of role.followers ?? []) {
//     roles.push(member)
//     if (member.followers) {
//       roles.push(...handleRoles(member))
//     }
//   }
//   return roles
// }

// function handleKnowledgebases(role: IXpertRole) {
//   const items = []
//   for (const member of role.followers ?? []) {
//     items.push(...(member.knowledgebases ?? []))
//     if (member.followers) {
//       items.push(...handleKnowledgebases(member))
//     }
//   }
//   return items
// }

// function handleToolsets(role: IXpertRole) {
//   const items = []
//   for (const member of role.followers ?? []) {
//     items.push(...(member.toolsets ?? []))
//     if (member.followers) {
//       items.push(...handleToolsets(member))
//     }
//   }
//   return items
// }