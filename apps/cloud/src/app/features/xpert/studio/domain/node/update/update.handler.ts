import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'
import { UpdateNodeRequest } from './update.request'
import { TXpertTeamNode } from 'apps/cloud/src/app/@core'

export class UpdateNodeHandler implements IHandler<UpdateNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: UpdateNodeRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      const index = draft.nodes.findIndex((_) => _.key === request.key)
      if (index > -1) {
        draft.nodes[index] = {
          ...draft.nodes[index],
          ...request.node
        } as TXpertTeamNode
      } else {
        throw new Error(`Node with key ${request.key} not found!`)
      }

      return {
        draft
      }
    })
  }
}
