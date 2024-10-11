import { inject, Injectable, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { IPoint } from '@foblex/2d'
import { IXpertRole, TXpertRoleDraft } from '@metad/contracts'
import { createStore, Store, withProps } from '@ngneat/elf'
import { stateHistory } from '@ngneat/elf-state-history'
import { XpertRoleService } from 'apps/cloud/src/app/@core'
import * as CryptoJS from 'crypto-js'
import { isEqual, negate } from 'lodash-es'
import { injectParams } from 'ngxtension/inject-params'
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  tap
} from 'rxjs'
import { CreateConnectionHandler, CreateConnectionRequest, ToConnectionViewModelHandler } from './connection'
import { IStudioModel } from './i-studio-model'
import {
  CreateRoleHandler,
  CreateRoleRequest,
  GetRoleHandler,
  GetRoleRequest,
  MoveRoleHandler,
  MoveRoleRequest,
  RemoveRoleHandler,
  RemoveRoleRequest,
  ToRoleViewModelHandler,
  UpdateRoleHandler,
  UpdateRoleRequest
} from './role'
import { IStudioStorage } from './studio.storage'
import { EReloadReason, IStudioStore, TStateHistory } from './types'
import { CreateKnowledgeHandler, CreateKnowledgeRequest, ToKnowledgeViewModelHandler } from './knowledge'

@Injectable()
export class XpertStudioApiService {
  readonly paramId = injectParams('id')
  readonly xpertRoleService = inject(XpertRoleService)

  // private storage: IStudioStorage = null
  readonly store = createStore({ name: 'xpertStudio' }, withProps<IStudioStore>({ draft: null }))
  readonly #stateHistory = stateHistory<Store, IStudioStore>(this.store, {
    comparatorFn: negate(isEqual)
  })
  get storage(): IStudioStorage {
    return this.store.getValue().draft
  }

  readonly #reload: Subject<EReloadReason> = new Subject<EReloadReason>()

  public get reload$(): Observable<EReloadReason> {
    return this.#reload.asObservable().pipe(filter((value) => value !== EReloadReason.MOVED))
  }
  readonly paramId$ = toObservable(this.paramId)

  readonly team = signal<IXpertRole>(null)
  readonly versions = toSignal(
    this.paramId$.pipe(
      distinctUntilChanged(),
      switchMap((id) => this.xpertRoleService.getVersions(id))
    )
  )

  readonly draft = signal<TXpertRoleDraft>(null)
  readonly stateHistories = signal<TStateHistory[]>([])

  readonly refresh$ = new BehaviorSubject<void>(null)

  private saveDraftSub = this.refresh$
    .pipe(
      switchMap(() =>
        combineLatest([
          this.paramId$.pipe(
            distinctUntilChanged(),
            switchMap((id) => this.xpertRoleService.getTeam(id)),
            tap((role) => {
              this.#stateHistory.clear()
              this.draft.set(role.draft)
              this.initRole(role)
              this.stateHistories.update(() => [{reason: EReloadReason.INIT, cursor: this.#stateHistory.getPast().length}])
            })
          ),
          this.#reload.pipe(
            filter((event) => event !== EReloadReason.INIT),
            tap((event) => this.stateHistories.update((state) => [...state, {reason: event, cursor: this.#stateHistory.getPast().length}]))
          )
        ])
      ),
      map(() => calculateHash(JSON.stringify(this.storage))),
      distinctUntilChanged(),
      map(() => this.storage),
      debounceTime(10 * 1000),
      switchMap((draft) => this.xpertRoleService.saveDraft(this.storage.team.id, draft))
    )
    .subscribe(() => this.draft.set(structuredClone(this.storage)))

  public initRole(role: IXpertRole) {
    this.team.set(role)
    this.store.update((state) => ({
      draft: (role.draft
        ? {
            ...role.draft,
            team: {
              ...(role.draft.team ?? {}),
              id: role.id
            }
          }
        : {
            team: role,
            roles: []
          }) as IStudioStorage
    }))

    this.#reload.next(EReloadReason.INIT)
  }

  public resume() {
    this.xpertRoleService.update(this.team().id, { draft: null }).subscribe(() => {
      this.refresh$.next()
    })
  }

  public get(): IStudioModel {
    return (
      this.storage && {
        team: this.storage.team,
        roles: new ToRoleViewModelHandler(this.storage).handle(),
        knowledges: new ToKnowledgeViewModelHandler(this.storage).handle(),
        connections: new ToConnectionViewModelHandler(this.storage).handle()
      }
    )
  }

  public createRole(position: IPoint): void {
    new CreateRoleHandler(this.storage).handle(new CreateRoleRequest(position))
    this.#reload.next(EReloadReason.JUST_RELOAD)
  }

  public createConnection(outputId: string, inputId: string): void {
    new CreateConnectionHandler(this.storage).handle(new CreateConnectionRequest(outputId, inputId))
    this.#reload.next(EReloadReason.JUST_RELOAD)
  }

  public moveXpertRole(key: string, position: IPoint): void {
    new MoveRoleHandler(this.store).handle(new MoveRoleRequest(key, position))

    this.#reload.next(EReloadReason.MOVED)
  }

  public removeRole(key: string) {
    new RemoveRoleHandler(this.storage).handle(new RemoveRoleRequest(key))
    this.#reload.next(EReloadReason.JUST_RELOAD)
  }

  public getNode(key: string) {
    return new GetRoleHandler(this.storage).handle(new GetRoleRequest(key))
  }

  public updateXpertRole(key: string, entity: Partial<IXpertRole>) {
    return new UpdateRoleHandler(this.storage).handle(new UpdateRoleRequest(key, entity))
  }

  public reload() {
    this.#reload.next(EReloadReason.JUST_RELOAD)
  }

  getHistoryCursor() {
    return this.#stateHistory.getPast().length
  }

  gotoHistoryCursor(index: number) {
    this.#stateHistory.jumpToPast(index)
  }

  undo() {
    this.#stateHistory.undo()
  }

  redo() {
    this.#stateHistory.redo()
  }

  clearHistory() {
    this.#stateHistory.clear()
  }

  // Knowledge
  createKnowledge(position: IPoint): void {
    new CreateKnowledgeHandler(this.store).handle(new CreateKnowledgeRequest(position))
    this.#reload.next(EReloadReason.KNOWLEDGE_CREATED)
  }
}

function calculateHash(jsonString: string): string {
  return CryptoJS.SHA256(jsonString).toString(CryptoJS.enc.Hex)
}
