import { inject, Injectable } from '@angular/core'
import { map, Observable, Subject } from 'rxjs'
import { XpertStudioApiService } from './xpert-api.service'

@Injectable()
export class SelectionService {
  readonly apiService = inject(XpertStudioApiService)

  private selection: Subject<ISelectionEvent> = new Subject<ISelectionEvent>()

  public get selection$(): Observable<ISelectionEvent> {
    return this.selection.asObservable()
  }
  /**
   * @deprecated use nodes
   */
  private column: string | null = null
  /**
   * @deprecated use nodes
   */
  private tables: string[] = []

  private nodes: string[] = []

  public singleNode$ = this.selection$.pipe(
    map((event) => (event.nodes?.[0] ? this.apiService.getNode(event.nodes[0]) : null))
  )

  public setNodes(nodes: string[]): void {
    this.nodes = nodes
    this.column = null
    this.selection.next({ nodes: this.nodes })
  }
  /**
   * @deprecated use nodes
   */
  public setColumn(table: string, column: string | null): void {
    this.tables = [table]
    this.column = column
    this.selection.next({ tables: this.tables, column: this.column })
  }
  /**
   * @deprecated use nodes
   */
  public setTables(tables: string[]): void {
    this.tables = tables
    this.column = null
    this.selection.next({ tables: this.tables, column: this.column })
  }

  public reset(): void {
    this.tables = []
    this.column = null
    this.selection.next({ tables: this.tables, column: this.column })
  }

  public getColumn(): string | null {
    return this.column
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
