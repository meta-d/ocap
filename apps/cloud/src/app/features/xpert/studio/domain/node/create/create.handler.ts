import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { uuid, XpertRoleTypeEnum } from 'apps/cloud/src/app/@core'
import { IStudioStore } from '../../types'
import { CreateNodeRequest } from './create.request'
import { IKnowledgebaseStorageModel } from '../../knowledge'


export class CreateNodeHandler implements IHandler<CreateNodeRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateNodeRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      switch(request.type) {
        case 'knowledge': {
          draft.knowledges ??= []
          draft.knowledges.push({
            id: uuid(),
            name: null,
            position: request.position
          } as IKnowledgebaseStorageModel)
          break
        }
        case 'role': {
          draft.roles ??= []
          draft.roles.push({
            type: XpertRoleTypeEnum.Agent,
            key: uuid(),
            name: null,
            title: uuid(),
            options: {
              position: request.position
            }
          })
          break
        }
      }
      
      return {
        draft
      }
    })
  }
}
