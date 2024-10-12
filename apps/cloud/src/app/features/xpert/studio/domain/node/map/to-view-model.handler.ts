import { IHandler } from '@foblex/mediator'
import { IXpertRole } from 'apps/cloud/src/app/@core'
import { uniqBy } from 'lodash-es'
import { IStudioStorage } from '../../studio.storage'
import { TNodeViewModel } from '../i-view-model'
import { IKnowledgebaseStorageModel } from '../../knowledge'


export class ToNodeViewModelHandler implements IHandler<void, TNodeViewModel[]> {
  constructor(private storage: IStudioStorage) {}

  public handle(): TNodeViewModel[] {
    const nodes = []

    nodes.push(...[...(this.storage.roles ?? []), this.storage.team, ...handleRoles(this.storage.team)].map((x) => {
      return {
        key: x.key ?? x.id,
        type: 'role',
        position: x.position,
        entity: x,
      }
    }))

    // knowledgebases
    const knowledgebases = [...(this.storage.knowledges ?? []), ...(this.storage.team.knowledgebases ?? [])] as IKnowledgebaseStorageModel[]
    knowledgebases.push(...handleKnowledgebases(this.storage.team))

    return nodes.concat(...uniqBy(knowledgebases, 'id').map((x: IKnowledgebaseStorageModel) => {
      return {
        key: x.id,
        type: 'knowledge',
        position: x.position,
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
