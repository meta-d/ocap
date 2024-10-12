import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { uuid, XpertRoleTypeEnum } from 'apps/cloud/src/app/@core'
import { IStudioStore } from '../../types'
import { CreateNodeRequest } from './create.request'

export class CreateNodeHandler implements IHandler<CreateNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateNodeRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      if (request.entity) {
        if (draft.nodes.find((item) => item.entity?.id === request.entity.id)) {
          throw new Error(`Node with id ${request.entity.id} already added!`)
        }
      }

      let entity = null
      switch(request.type) {
        case 'role': {
          entity = {
            type: XpertRoleTypeEnum.Agent,
            title: uuid(),
          }
        }
      }

      const key = request.entity?.id ?? uuid()

      draft.nodes.push({
        type: request.type,
        key,
        position: request.position,
        entity: request.entity ?? entity
      })
      return {
        draft
      }
    })
  }
}
