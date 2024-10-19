import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'
import { CreateTeamRequest } from './create.request'
import { ToNodeViewModelHandler } from '../../node'
import { ToConnectionViewModelHandler } from '../../connection'

export class CreateTeamHandler implements IHandler<CreateTeamRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateTeamRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      // Create sub graph for xpert
      const xpert = request.team

      draft.nodes.push({
        type: 'xpert',
        key: request.team.id,
        position: request.position,
        size: {
          width: 400,
          height: 400
        },
        entity: request.team,
        nodes: new ToNodeViewModelHandler(xpert).handle(),
        connections: new ToConnectionViewModelHandler(xpert).handle()
      })

      return {
        draft
      }
    })
  }
}
