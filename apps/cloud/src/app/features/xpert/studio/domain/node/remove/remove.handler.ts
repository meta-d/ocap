import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { EReloadReason, IStudioStore } from '../../types'
import { RemoveNodeRequest } from './remove.request'

export class RemoveNodeHandler implements IHandler<RemoveNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: RemoveNodeRequest): EReloadReason {
    const node = this.store.getValue().draft.nodes.find((item) => item.key === request.key)
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      draft.nodes = draft.nodes.filter((item) => item.key !== request.key)
      draft.connections = draft.connections.filter(
        (item) => item.from !== request.key && item.to !== request.key
      )

      return {
        draft
      }
    })

    switch(node.type) {
      case 'knowledge':
        return EReloadReason.KNOWLEDGE_REMOVED
      case 'role':
        return EReloadReason.ROLE_REMOVED
    }
  }
}

// export function removeKnowledgebase(xpert: IXpertRole, key: string) {
//   xpert.knowledgebases = xpert.knowledgebases?.filter((item) => item.id !== key)
//   xpert.members?.forEach((member) => removeKnowledgebase(member, key))
// }
