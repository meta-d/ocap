import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { ToConnectionViewModelHandler } from '../../connection'
import { ToNodeViewModelHandler } from '../../node'
import { IStudioStore } from '../../types'
import { CreateTeamRequest } from './create.request'

export class CreateTeamHandler implements IHandler<CreateTeamRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateTeamRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      // Create sub graph for xpert
      const xpert = request.team

      const {nodes, size} = new ToNodeViewModelHandler(xpert, {position: request.position}).handle()

      draft.nodes.push({
        type: 'xpert',
        key: request.team.id,
        position: request.position,
        size: size,
        entity: request.team,
        nodes,
        connections: new ToConnectionViewModelHandler(xpert).handle()
      })

      return {
        draft
      }
    })
  }
}
