import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'
import { MoveNodeRequest } from './move.request'

export class MoveNodeHandler implements IHandler<MoveNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: MoveNodeRequest): void {
    this.store.update((s) => {
      const draft = structuredClone(s.draft)

      const node = draft.nodes.find((item) => item.key === request.key)
      if (!node) {
        throw new Error(`Team node with key ${node.key} not found`)
      }
      node.position = request.position
      // switch(node.type) {
      //   case 'knowledge': {
          
      //     node.position = request.position
      //     break
      //   }
      //   case 'role': {
      //     const role = findXpertRole([...state.roles, state.team], node.key)
      //     if (!role) {
      //       throw new Error(`Xpert with key ${node.key} not found`)
      //     }
      //     role.position = request.position
      //     break
      //   }
      // }

      return { draft }
    })
  }
}
