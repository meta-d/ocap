import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IXpertRole } from 'apps/cloud/src/app/@core'
import { IStudioStore } from '../../types'
import { RemoveNodeRequest } from './remove.request'
import { removeXpertRole } from '../../studio.storage'


export class RemoveNodeHandler implements IHandler<RemoveNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: RemoveNodeRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      const node = request.node
      if (node.type === 'knowledge') {
        draft.knowledges = draft.knowledges.filter((item) => item.id !== node.key)
        draft.roles.forEach((role) => removeKnowledgebase(role, node.key))
        removeKnowledgebase(draft.team, node.key)
      }

      if (node.type === 'role') {
        draft.roles = removeXpertRole(draft.roles, node.key)
        draft.team.members = removeXpertRole(draft.team.members, node.key)
      }
      
      return {
        draft
      }
    })
  }
}

export function removeKnowledgebase(xpert: IXpertRole, key: string) {
  xpert.knowledgebases = xpert.knowledgebases?.filter((item) => item.id !== key)
  xpert.members?.forEach((member) => removeKnowledgebase(member, key))
}
