import { computed, inject, Injectable, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { IPoint, IRect } from '@foblex/2d'
import { nonNullable } from '@metad/core'
import { createStore, Store, withProps } from '@ngneat/elf'
import { stateHistory } from '@ngneat/elf-state-history'
import { KnowledgebaseService, PACCopilotService, ToastrService, XpertService, XpertToolsetService } from 'apps/cloud/src/app/@core'
import * as CryptoJS from 'crypto-js'
import { isEqual, negate } from 'lodash-es'
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap
} from 'rxjs'
import {
  getErrorMessage,
  IKnowledgebase,
  IXpert,
  IXpertAgent,
  IXpertToolset,
  TXpertOptions,
  TXpertTeamDraft,
  TXpertTeamNode
} from '../../../../@core/types'
import { CreateConnectionHandler, CreateConnectionRequest, ToConnectionViewModelHandler } from './connection'
import { LayoutHandler, LayoutRequest } from './layout'
import {
  CreateNodeHandler,
  CreateNodeRequest,
  MoveNodeHandler,
  MoveNodeRequest,
  RemoveNodeHandler,
  RemoveNodeRequest,
  ToNodeViewModelHandler,
  UpdateAgentHandler,
  UpdateAgentRequest,
  UpdateNodeHandler,
  UpdateNodeRequest
} from './node'
import { CreateTeamHandler, CreateTeamRequest, UpdateXpertHandler, UpdateXpertRequest } from './xpert'
import { EReloadReason, IStudioStore, TStateHistory } from './types'
import { ExpandTeamHandler } from './xpert/expand/expand.handler'
import { ExpandTeamRequest } from './xpert/expand/expand.request'
import { injectGetXpertsByWorkspace, injectGetXpertTeam } from '../../utils'
import { XpertComponent } from '../../xpert'


@Injectable()
export class XpertStudioApiService {
  readonly xpertRoleService = inject(XpertService)
  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly toolsetService = inject(XpertToolsetService)
  readonly copilotService = inject(PACCopilotService)
  readonly #toastr = inject(ToastrService)
  readonly xpertComponent = inject(XpertComponent)
  readonly getXpertTeam = injectGetXpertTeam()
  readonly getXpertsByWorkspace = injectGetXpertsByWorkspace()

  readonly store = createStore({ name: 'xpertStudio' }, withProps<IStudioStore>({ draft: null }))
  readonly #stateHistory = stateHistory<Store, IStudioStore>(this.store, {
    comparatorFn: negate(isEqual)
  })
  /**
   * @deprecated
   */
  get storage(): TXpertTeamDraft {
    return this.store.getValue().draft
  }

  readonly #reload: Subject<EReloadReason> = new Subject<EReloadReason>()

  public get reload$(): Observable<EReloadReason> {
    return this.#reload.asObservable().pipe(filter((value) => value !== EReloadReason.MOVED))
  }
  readonly paramId$ = this.xpertComponent.paramId$

  readonly #refresh$ = new BehaviorSubject<void>(null)

  readonly team = signal<IXpert>(null)
  readonly versions = toSignal(
    this.#refresh$.pipe(
      switchMap(() => this.paramId$.pipe(distinctUntilChanged())),
      switchMap((id) => this.xpertRoleService.getVersions(id))
    )
  )

  /**
   * pristine draft
   */
  readonly draft = signal<TXpertTeamDraft>(null)
  readonly unsaved = signal(false)
  readonly stateHistories = signal<TStateHistory[]>([])
  readonly viewModel = toSignal(this.store.pipe(map((state) => state.draft)))
  readonly collaboratorDetails = signal<Record<string, IXpert>>({})
  readonly primaryAgent = computed<IXpertAgent>(() => {
    const primaryAgentKey = this.team()?.agent.key
    if (primaryAgentKey && this.viewModel()?.nodes) {
      return this.viewModel().nodes.find((_) => _.type === 'agent' && _.key === primaryAgentKey)?.entity as IXpertAgent
    }
    return null
  })

  // knowledgebases
  readonly knowledgebases$ = this.knowledgebaseService.getAllInOrg().pipe(
    map(({ items }) => items),
    shareReplay(1)
  )
  readonly toolsets$ = this.toolsetService.getAllInOrg().pipe(
    map(({ items }) => items),
    shareReplay(1)
  )
  readonly workspace = computed(() => this.team()?.workspace, { equal: (a, b) => a?.id === b?.id })

  readonly collaborators$ = toObservable(this.team).pipe(
    filter(nonNullable),
    map((team) => team?.workspace),
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    switchMap((workspace) => this.getXpertsByWorkspace(workspace)),
    map(({ items }) => items.filter((_) => _.id !== this.team().id)),
    shareReplay(1)
  )

  private saveDraftSub = this.#refresh$
    .pipe(
      switchMap(() =>
        combineLatest([
          this.paramId$.pipe(
            distinctUntilChanged(),
            switchMap((id) => this.getXpertTeam(id)),
            tap((role) => {
              this.#stateHistory.clear()
              this.draft.set(role.draft)
              this.initRole(role)
              this.stateHistories.update(() => [
                { reason: EReloadReason.INIT, cursor: this.#stateHistory.getPast().length }
              ])
            })
          ),
          this.#reload.pipe(
            filter((event) => event !== EReloadReason.INIT),
            tap((event) =>
              this.stateHistories.update((state) => [
                ...state,
                { reason: event, cursor: this.#stateHistory.getPast().length }
              ])
            )
          )
        ])
      ),
      map(() => calculateHash(JSON.stringify(this.storage))),
      distinctUntilChanged(),
      map(() => this.storage),
      tap(() => this.unsaved.set(true)),
      debounceTime(5 * 1000),
      switchMap((draft) => this.xpertRoleService.saveDraft(this.storage.team.id, draft))
    )
    .subscribe((draft) => {
      this.unsaved.set(false)
      this.draft.set(draft)
    })

  

  public initRole(xpert: IXpert) {
    this.team.set(xpert)

    const team = xpert.draft?.team ?? xpert
    const nodes = xpert.draft?.nodes ?? new ToNodeViewModelHandler(xpert).handle()
    const connections = xpert.draft?.connections ?? new ToConnectionViewModelHandler(xpert).handle()

    this.store.update(() => ({
      draft: {
        team: {
          ...team,
          id: xpert.id
        },
        nodes,
        connections
      } as TXpertTeamDraft
    }))

    this.#reload.next(EReloadReason.INIT)
  }

  public resume() {
    this.xpertRoleService.update(this.team().id, { draft: null }).subscribe(() => {
      this.refresh()
    })
  }

  public refresh() {
    this.#refresh$.next()
  }

  public getNode(key: string) {
    return this.viewModel().nodes.find((item) => item.key === key)
  }

  public reload() {
    this.#reload.next(EReloadReason.JUST_RELOAD)
  }

  getHistoryCursor() {
    return this.#stateHistory.getPast().length
  }

  gotoHistoryCursor(index: number) {
    if (index > this.getHistoryCursor()) {
      this.#stateHistory.jumpToFuture(index)
    } else {
      this.#stateHistory.jumpToPast(index)
    }
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

  // Connections
  public createConnection(outputId: string, inputId: string, oldFInputId?: string): void {
    new CreateConnectionHandler(this.store).handle(new CreateConnectionRequest(outputId, inputId, oldFInputId))
    this.#reload.next(EReloadReason.CONNECTION_CHANGED)
  }

  // Knowledge
  public createKnowledge(position: IPoint, knowledge: IKnowledgebase): void {
    new CreateNodeHandler(this.store).handle(new CreateNodeRequest('knowledge', position, knowledge))
    this.#reload.next(EReloadReason.KNOWLEDGE_CREATED)
  }

  // Nodes
  public moveNode(key: string, position: IPoint): void {
    new MoveNodeHandler(this.store).handle(new MoveNodeRequest(key, position))
    this.#reload.next(EReloadReason.MOVED)
  }
  public resizeNode(key: string, size: IRect) {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      const node = draft.nodes.find((node) => node.key === key)
      if (node) {
        node.size = size
      }
      return { draft }
    })
    this.#reload.next(EReloadReason.RESIZE)
  }

  public expandXpertNode(key: string) {
    new ExpandTeamHandler(this.store, this).handle(new ExpandTeamRequest(key))
    this.#reload.next(EReloadReason.JUST_RELOAD)
  }

  public updateNode(key: string, value: Partial<TXpertTeamNode>): void {
    new UpdateNodeHandler(this.store).handle(new UpdateNodeRequest(key, value))
  }
  public removeNode(key: string) {
    // Remove node
    const event = new RemoveNodeHandler(this.store).handle(new RemoveNodeRequest(key))
    event && this.#reload.next(event)
  }
  // Role node
  public createAgent(position: IPoint): void {
    new CreateNodeHandler(this.store).handle(new CreateNodeRequest('agent', position))
    this.#reload.next(EReloadReason.AGENT_CREATED)
  }
  public async createCollaborator(position: IPoint, team: IXpert) {
    this.getXpertTeam(team.id).subscribe({
      next: (xpert) => {
        new CreateTeamHandler(this.store).handle(new CreateTeamRequest(position, xpert))
        this.#reload.next(EReloadReason.XPERT_ADDED)
      },
      error: (error) => {
        this.#toastr.error(getErrorMessage(error))
      }
    })
  }
  public createToolset(position: IPoint, toolset: IXpertToolset): void {
    new CreateNodeHandler(this.store).handle(new CreateNodeRequest('toolset', position, toolset))
    this.#reload.next(EReloadReason.TOOLSET_CREATED)
  }
  public updateXpertAgent(key: string, entity: Partial<IXpertAgent>, options?: {emitEvent: boolean}) {
    new UpdateAgentHandler(this.store).handle(new UpdateAgentRequest(key, entity))
    if (options?.emitEvent == null || options.emitEvent) {
      this.#reload.next(EReloadReason.XPERT_UPDATED)
    }
  }
  public updateXpert(xpert: Partial<IXpert>) {
    new UpdateXpertHandler(this.store).handle(new UpdateXpertRequest(xpert))
    this.#reload.next(EReloadReason.XPERT_UPDATED)
  }
  public updateXpertOptions(options: Partial<TXpertOptions>) {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)
      draft.team = {
        ...draft.team,
        options: {
          ...(draft.team.options ?? {}),
          ...options
        }
      }

      return {
        draft
      }
    })
    this.#reload.next(EReloadReason.XPERT_UPDATED)
  }

  public autoLayout() {
    new LayoutHandler(this.store).handle(new LayoutRequest('TB'))
    // this.#reload.next(EReloadReason.AUTO_LAYOUT)
  }
}

function calculateHash(jsonString: string): string {
  return CryptoJS.SHA256(jsonString).toString(CryptoJS.enc.Hex)
}
