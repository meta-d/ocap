import { IHandler } from '@foblex/mediator'
import { assign } from 'lodash-es'
import { UpdateAgentRequest } from './update-agent.request'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'

export class UpdateAgentHandler implements IHandler<UpdateAgentRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: UpdateAgentRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      const node = draft.nodes.find((item) => item.key === request.key)
      if (!node) {
        throw new Error(`Xpert with key ${request.key} not found`)
      }
      assign(node.entity, request.entity)
      return {
        draft
      }
    })
  }
}
