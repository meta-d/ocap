import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Injectable } from '@angular/core'
import { IModelRole, MDX } from '@metad/contracts'
import { ComponentSubStore } from '@metad/store'
import { ToastrService } from 'apps/cloud/src/app/@core'
import { includes } from 'lodash-es'
import { SemanticModelService } from '../model.service'
import { PACModelState } from '../types'

@Injectable()
export class AccessControlStateService extends ComponentSubStore<IModelRole[], PACModelState> {
  get roles() {
    return this.get((state) => state)
  }

  public readonly roles$ = this.select((state) => state)
  constructor(public modelService: SemanticModelService, private _toastrService: ToastrService) {
    super([] as IModelRole[])

    this.connect(this.modelService, { parent: ['model', 'roles'] })
  }

  // Updaters for Roles
  readonly addRole = this.updater((state, role: IModelRole) => {
    const options = role.options ?? (role.type === 'union'
    ? { name: '', roleUsages: [] }
    : {
        name: '',
        schemaGrant: {
          access: MDX.Access.all,
          cubeGrants: []
        }
      })
    state.push({
      ...role,
      options: options as MDX.Role,
      users: []
    })
  })

  readonly removeRole = this.updater((state, key: string) => {
    const index = state.findIndex((item) => item.key === key)
    if (index > -1) {
      state.splice(index, 1)
    }
  })

  readonly moveRoleInArray = this.updater((state, event: CdkDragDrop<IModelRole[]>) => {
    moveItemInArray(state, event.previousIndex, event.currentIndex)
  })

  readonly changeUserRoles = this.updater((state, { user, roles }: any) => {
    state.forEach((role: IModelRole) => {
      if (includes(roles, role.name)) {
        if (!role.users.find((item) => item.id === user.id)) {
          role.users.push(user)
        }
      } else {
        const index = role.users.findIndex((item) => item.id === user.id)
        if (index > -1) {
          role.users.splice(index, 1)
        }
      }
    })
  })

  readonly removeUser = this.updater((state, id: string) => {
    state.forEach((role: IModelRole) => {
      const index = role.users.findIndex((item) => item.id === id)
      if (index > -1) {
        role.users.splice(index, 1)
      }
    })
  })
}
