import { computed, inject, Injectable, signal } from '@angular/core'
import { map, Observable, Subject } from 'rxjs'
import { XpertStudioApiService } from './xpert-api.service'

@Injectable()
export class SelectionService {
  readonly apiService = inject(XpertStudioApiService)

  /**
   * Single selected node
   */
  readonly #selectedNodeKey = signal<string>(null)
  readonly selectedNode = computed(() => {
    if (!this.#selectedNodeKey()) {
      return null
    }
    return this.apiService.getNode(this.#selectedNodeKey())
  })
  readonly selectedNodeKey = computed(() => this.#selectedNodeKey())

  private selection: Subject<ISelectionEvent> = new Subject<ISelectionEvent>()

  public get selection$(): Observable<ISelectionEvent> {
    return this.selection.asObservable()
  }

  private nodes: string[] = []

  public singleNode$ = this.selection$.pipe(
    map((event) => (event.nodes?.[0] ? this.apiService.getNode(event.nodes[0]) : null))
  )

  public setNodes(nodes: string[]): void {
    this.nodes = nodes
    this.selection.next({ nodes: this.nodes })
  }
 
  selectNode(key: string) {
    this.#selectedNodeKey.set(key)
  }
}

export interface ISelectionEvent {
  nodes?: string[]

  /**
   * @deprecated use nodes
   */
  tables?: string[]
  /**
   * @deprecated use nodes
   */
  column?: string | null
}
