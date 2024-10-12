import { IHandler } from '@foblex/mediator'
import { assign } from 'lodash-es'
import { UpdateRoleRequest } from './update-role.request'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'

export class UpdateRoleHandler implements IHandler<UpdateRoleRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: UpdateRoleRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      const node = draft.nodes.find((item) => item.key === request.key)
      if (!node) {
        throw new Error(`Xpert with key ${request.key} not found`)
      }
      assign(node, request.entity)
      return {
        draft
      }
    })
  }
}
