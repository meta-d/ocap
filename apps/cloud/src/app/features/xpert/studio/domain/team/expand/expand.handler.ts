import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { TXpertTeamDraft, TXpertTeamNode } from 'apps/cloud/src/app/@core'
import { firstValueFrom } from 'rxjs'
import { ToConnectionViewModelHandler } from '../../connection'
import { ToNodeViewModelHandler } from '../../node'
import { IStudioStore } from '../../types'
import { XpertStudioApiService } from '../../xpert-api.service'
import { ExpandTeamRequest } from './expand.request'

export class ExpandTeamHandler implements IHandler<ExpandTeamRequest> {
  constructor(
    private store: Store<StoreDef, IStudioStore>,
    private apiService: XpertStudioApiService
  ) {}

  public async handle(request: ExpandTeamRequest) {
    const xpertNode = getXpertNode(this.store.getValue().draft, request.key)
    let xpert = null
    // 还未加载 detail of xpert team
    if (!xpertNode.expanded && !xpertNode.entity.agents) {
      xpert = await firstValueFrom(this.apiService.getXpertTeam(request.key))
    }

    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      const node = getXpertNode(draft, request.key)
      if (node) {
        node.expanded = !node.expanded
        if (node.expanded) {
          if (xpert) {
            node.entity = xpert
          }
          node.nodes = new ToNodeViewModelHandler(node.entity).handle()
          node.connections = new ToConnectionViewModelHandler(node.entity).handle()
        } else {
          node.nodes = node.nodes.filter((_) => _.key === node.entity.agent.key)
          node.connections = null
        }
      }

      return { draft }
    })
  }
}

function getXpertNode(draft: TXpertTeamDraft, key: string) {
  return draft.nodes.find((node) => node.type === 'xpert' && node.key === key) as TXpertTeamNode & {
    type: 'xpert'
  }
}
