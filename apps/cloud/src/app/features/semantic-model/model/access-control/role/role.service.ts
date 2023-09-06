import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop'
import { Injectable } from '@angular/core'
import { IModelRole, IUser, MDX } from '@metad/contracts'
import { ComponentSubStore } from '@metad/store'
import { ToastrService } from 'apps/cloud/src/app/@core'
import { userLabel } from 'apps/cloud/src/app/@shared'
import { SemanticModelService } from '../../model.service'
import { PACModelState } from '../../types'


@Injectable()
export class RoleStateService extends ComponentSubStore<IModelRole, PACModelState> {

  public readonly schemaGrant$ = this.select((state) => state.options.schemaGrant)
  public readonly cubes$ = this.select((state) => state.options.schemaGrant?.cubeGrants)
  public readonly roleUsages$ = this.select((state) => state.options?.roleUsages)
  public readonly roleUsers$ = this.select((state) => state.users)

  constructor(public modelService: SemanticModelService, private _toastrService: ToastrService) {
    super({} as IModelRole)
  }

  public init(key: string) {
    this.connect(this.modelService, { parent: ['model', 'roles', key], arrayKey: 'key' })
  }

  readonly updateSchemaGrant = this.updater((state, schemaGrant: Partial<MDX.SchemaGrant>) => {
    state.options.schemaGrant = {
      ...state.options.schemaGrant,
      ...schemaGrant
    }
  })

  readonly addCube = this.updater((state, cube: string) => {
    state.options.schemaGrant = state.options.schemaGrant ?? {cubeGrants: []} as MDX.SchemaGrant
    if (state.options.schemaGrant.cubeGrants.find((item) => item.cube === cube)) {
      this._toastrService.warning('多维数据集已经存在')
    } else {
      state.options.schemaGrant.cubeGrants.push({
        cube,
        access: MDX.Access.all,
        hierarchyGrants: []
      })
    }
  })

  readonly removeCube = this.updater((state, name: string) => {
    const index = state.options.schemaGrant.cubeGrants.findIndex((item) => item.cube === name)
    if (index > -1) {
      state.options.schemaGrant.cubeGrants.splice(index, 1)
    }
  })

  readonly moveItemInCubes = this.updater((state, event: CdkDragDrop<any>) => {
    moveItemInArray(state.options.schemaGrant.cubeGrants, event.previousIndex, event.currentIndex)
  })
  
  readonly addUsers = this.updater((state, users: IUser[]) => {
    state.users = state.users ?? []
    users.forEach((user) => {
      if (state.users.find((item) => item.id === user.id)) {
        this._toastrService.warning('用户已经存在', {}, userLabel(user))
      } else {
        state.users.push(user)
      }
    })
  })

  readonly removeUser = this.updater((state, id: string) => {
    const index = state.users.findIndex((item) => item.id === id)
    if (index > -1) {
      state.users.splice(index, 1)
    }
  })

  readonly addRoleUsage = this.updater((state, {roleName, currentIndex}: any) => {
    const index = state.options.roleUsages.findIndex((name) => name === roleName)
    if (index > -1) {
      this._toastrService.warning('角色已经存在')
      return
    }

    state.options.roleUsages.splice(currentIndex, 0, roleName)
  })

  readonly removeRoleUsage = this.updater((state, name: string) => {
    const index = state.options.roleUsages.findIndex((item) => item === name)
    if (index > -1) {
      state.options.roleUsages.splice(index, 1)  
    } else {
      this._toastrService.error('角色不存在')
    }
  })

  readonly moveItemInRoleUsages = this.updater((state, event: CdkDragDrop<any>) => {
    moveItemInArray(state.options.roleUsages, event.previousIndex, event.currentIndex)
  })
}
