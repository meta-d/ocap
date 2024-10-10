import { inject, Injectable } from '@angular/core'
import { IPoint } from '@foblex/2d'
import { generateGuid } from '@foblex/utils'
import { IXpertRole } from '@metad/contracts'
import { debounceTime, distinctUntilChanged, filter, map, Observable, skip, Subject, switchMap } from 'rxjs'
import { CreateConnectionHandler, CreateConnectionRequest, ToConnectionViewModelHandler } from './connection'
import { IStudioModel } from './i-studio-model'
import { CreateRoleHandler, CreateRoleRequest, MoveRoleHandler, MoveRoleRequest, ToRoleViewModelHandler } from './role'
import { IStudioStorage } from './studio.storage'
import { XpertRoleService } from 'apps/cloud/src/app/@core'
import { injectParams } from 'ngxtension/inject-params'
import { toObservable } from '@angular/core/rxjs-interop'
import { getXpertRoleKey } from './types'
import * as CryptoJS from 'crypto-js'


@Injectable()
export class XpertStudioApiService {
  readonly teamId = injectParams('id')
  readonly xpertRoleService = inject(XpertRoleService)

  private storage: IStudioStorage = null

  private reload: Subject<EReloadReason> = new Subject<EReloadReason>()

  public get reload$(): Observable<EReloadReason> {
    return this.reload.asObservable().pipe(
      filter((value) => value !== EReloadReason.MOVED)
    )
  }

  private teamSub = toObservable(this.teamId).pipe(
    distinctUntilChanged(),
    switchMap((id) => this.xpertRoleService.getOneById(id, { relations: ['members', 'toolsets'] }))
  ).subscribe((role) => this.initRole(role))

  private saveDraftSub = this.reload.pipe(
    skip(1),
    map(() => calculateHash(JSON.stringify(this.storage))),
    distinctUntilChanged(),
    map(() => this.storage),
    debounceTime(10 * 1000),
    switchMap((draft) => this.xpertRoleService.saveDraft(this.storage.team.id, draft))
  ).subscribe()

  public initRole(role: IXpertRole) {
    this.storage = role.draft ?? {
      team: role,
      roles: [],
    }

    this.reload.next(EReloadReason.JUST_RELOAD)
  }

  public get(): IStudioModel {
    const roles = []
    const connections = []
    this.storage?.team?.members?.forEach((member) => {
      roles.push(member)
      connections.push({
        key: generateGuid(),
        from: getXpertRoleKey(this.storage.team),
        to: getXpertRoleKey(member)
      })
    })

    return this.storage && {
      team: this.storage.team,
      roles: new ToRoleViewModelHandler([this.storage.team, ...this.storage.roles, ...roles]).handle(),
      connections: new ToConnectionViewModelHandler(connections).handle()
    }
  }

  public createRole(position: IPoint): void {
    new CreateRoleHandler(this.storage).handle(new CreateRoleRequest(position))
    this.reload.next(EReloadReason.JUST_RELOAD)
  }

  public createConnection(outputId: string, inputId: string): void {
    new CreateConnectionHandler(this.storage).handle(new CreateConnectionRequest(outputId, inputId))
    this.reload.next(EReloadReason.JUST_RELOAD)
  }

  public moveXpertRole(key: string, position: IPoint): void {
    new MoveRoleHandler(this.storage).handle(
      new MoveRoleRequest(key, position)
    )
    this.reload.next(EReloadReason.MOVED)
  }
  
}

export enum EReloadReason {
  JUST_RELOAD,

  CONNECTION_CHANGED,
  
  MOVED
}


function calculateHash(jsonString: string): string {
  return CryptoJS.SHA256(jsonString).toString(CryptoJS.enc.Hex);
}