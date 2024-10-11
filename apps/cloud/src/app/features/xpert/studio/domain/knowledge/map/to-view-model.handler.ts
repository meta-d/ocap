import { IHandler } from '@foblex/mediator'
import { IXpertRole } from 'apps/cloud/src/app/@core'
import { uniqBy } from 'lodash-es'
import { IStudioStorage } from '../../studio.storage'
import { IKnowledgebaseViewModel } from '../i-view-model'

export class ToKnowledgeViewModelHandler implements IHandler<void, IKnowledgebaseViewModel[]> {
  constructor(private storage: IStudioStorage) {}

  public handle(): IKnowledgebaseViewModel[] {
    const knowledgebases = [...(this.storage.knowledges ?? []), ...(this.storage.team.knowledgebases ?? [])]
    knowledgebases.push(...handleKnowledgebases(this.storage.team))

    return uniqBy(knowledgebases, 'id').map((x) => {
      return {
        ...x,
        key: x.id,
      } as any
    })
  }
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
