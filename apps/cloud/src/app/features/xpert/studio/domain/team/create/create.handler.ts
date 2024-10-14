import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { uuid, XpertRoleTypeEnum } from 'apps/cloud/src/app/@core'
import { IStudioStore } from '../../types'
import { CreateTeamRequest } from './create.request'

export class CreateTeamHandler implements IHandler<CreateTeamRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateTeamRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      draft.teams ??= []
      draft.teams.push({
        id: request.team.id + '/team',
        title: request.team.title,
        position: request.position,
        size: {
          width: 400,
          height: 400
        },
        team: request.team
      })

      return {
        draft
      }
    })
  }
}
