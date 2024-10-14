import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { layout, graphlib } from '@dagrejs/dagre'
import Graph = graphlib.Graph
import { LayoutRequest } from './layout.request'
import { IStudioStore } from '../types'
import { uuid } from 'apps/cloud/src/app/@core'

export class LayoutHandler implements IHandler<LayoutRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: LayoutRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      // Create a new directed graph 
      const g = new Graph()
      g.setGraph({ rankdir: request.rankdir })
      draft.nodes.filter((_) => _.type === 'agent').forEach((node) => {
        g.setNode(node.key, { width: 300, height: 100, ...(node.position ?? {}) })
      })
      draft.connections.forEach((conn) => {
        g.setEdge(conn.from, conn.to, {})
      })
      layout(g)

      g.nodes().forEach((x) => {
        let node = g.node(x)
        const index = draft.nodes.findIndex((_) => _.key === x)
        if (index > -1) {
          draft.nodes[index] = {
            ...draft.nodes[index],
            position: {...node},
            hash: uuid()
          }
        }
      })
      
      return {
        draft
      }
    })
  }
}
