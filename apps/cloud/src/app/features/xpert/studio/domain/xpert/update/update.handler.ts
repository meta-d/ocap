import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'
import { UpdateXpertRequest } from './update.request'

export class UpdateXpertHandler implements IHandler<UpdateXpertRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: UpdateXpertRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      draft.team = {
        ...draft.team,
        ...request.xpert
      }

      return {
        draft
      }
    })
  }
}
