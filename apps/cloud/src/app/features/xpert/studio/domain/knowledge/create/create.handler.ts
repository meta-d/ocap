import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { uuid } from 'apps/cloud/src/app/@core'
import { IStudioStore } from '../../types'
import { IKnowledgebaseStorageModel } from '../i-storage-model'
import { CreateKnowledgeRequest } from './create.request'

export class CreateKnowledgeHandler implements IHandler<CreateKnowledgeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateKnowledgeRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      draft.knowledges ??= []
      draft.knowledges.push({
        id: uuid(),
        name: null,
        position: request.position
      } as IKnowledgebaseStorageModel)
      return {
        draft
      }
    })
  }
}
