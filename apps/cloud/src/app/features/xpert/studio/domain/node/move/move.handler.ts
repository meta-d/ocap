import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'
import { MoveNodeRequest } from './move.request'

export class MoveNodeHandler implements IHandler<MoveNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: MoveNodeRequest): void {
    this.store.update((s) => {
      const draft = structuredClone(s.draft)

      let _node = null
      for (const node of draft.nodes) {
        if (node.key === request.key) {
          _node = node
        }
        if (_node) {
          break
        }
        if (node.type === 'xpert' && node.nodes) {
          for (const sub of node.nodes) {
            if (sub.key === request.key) {
              _node = sub
            }
            if (_node) {
              break
            }
          }
        }
      }

      if (_node) {
        _node.position = {
          ...(_node.position ?? {}),
          ...request.position
        }
      } else {
        // throw new Error(`Team node with key ${request.key} not found`)
      }
      
      return { draft }
    })
  }
}
