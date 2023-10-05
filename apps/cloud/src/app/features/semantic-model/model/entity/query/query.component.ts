import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, inject } from '@angular/core'
import { EntitySchemaNode, EntitySchemaType } from '@metad/ocap-angular/entity'
import { measureFormatter, QueryReturn, serializeUniqueName } from '@metad/ocap-core'
import { BaseEditorDirective } from '@metad/components/editor'
import { convertQueryResultColumns } from '@metad/core'
import { TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { isPlainObject } from 'lodash-es'
import { BehaviorSubject, EMPTY, Observable, firstValueFrom } from 'rxjs'
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators'
import { ModelComponent } from '../../model.component'
import { SemanticModelService } from '../../model.service'
import { MODEL_TYPE } from '../../types'
import { serializePropertyUniqueName } from '../../utils'
import { ModelEntityService } from '../entity.service'
import { effectAction } from '@metad/ocap-angular/core'
import { Store } from '@metad/cloud/state'
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-entity-query',
  templateUrl: 'query.component.html',
  styleUrls: ['query.component.scss']
})
export class EntityQueryComponent extends TranslationBaseComponent {
  MODEL_TYPE = MODEL_TYPE
  
  private readonly store = inject(Store)

  @ViewChild('editor') editor!: BaseEditorDirective

  themeName = toSignal(this.store.preferredTheme$.pipe(map((theme) => theme?.split('-')[0])))

  queryKey: string
  statement = ''
  entities = []

  textSelection

  public readonly entitySets$ = this.modelService.entities$ // .pipe(tap((options) => console.log(options)))
  public readonly tables$ = this.modelService.selectDBTables$
  public readonly entityType$ = this.entityService.entityType$
  // 当前使用 MDX 查询
  public readonly useMDX$ = this.modelService.modelType$.pipe(
    map((modelType) => modelType === MODEL_TYPE.XMLA || modelType === MODEL_TYPE.OLAP)
  )
  public readonly modelType$ = this.modelService.modelType$

  // for results table
  public readonly loading$ = new BehaviorSubject<boolean>(null)
  columns
  data
  error: string

  constructor(
    public modelService: SemanticModelService,
    private modelComponent: ModelComponent,
    private entityService: ModelEntityService,
    private _cdr: ChangeDetectorRef
  ) {
    super()
  }

  query = effectAction((origin$: Observable<string>) => {
    return origin$.pipe(
      tap((statement) => {
        if (statement) {
          this.error = null
          this.loading$.next(true)
        } else {
          this.error = null
          this.loading$.next(false)
        }
      }),
      switchMap((statement) => {
        return statement ? this.modelService.dataSource.query({ statement }).pipe(
          catchError((error) => {
            console.error(error)
            this.error = error
            return EMPTY
          }),
          tap(({ status, error, schema, data }: QueryReturn<unknown>) => {
            if (error) {
              console.error(error)
              this.error = error
              this._cdr.detectChanges()
              return
            }
    
            const columns = convertQueryResultColumns(schema)
    
            if (isPlainObject(data)) {
              columns.push(...typeOfObj(data))
              data = [data]
            }
    
            this.data = data
            this.columns = columns
    
            console.group(`sql results`)
            console.debug(`statement`, statement)
            console.debug(`data`, data)
            console.debug(`columns`, columns)
            console.groupEnd()
    
            this._cdr.detectChanges()
          }),
          finalize(() => {
            this.loading$.next(false)
            this._cdr.detectChanges()
          })) : EMPTY
      })
    )
  })

  run() {
    const statement: string = this.editor.getSelectText()?.trim() || this.statement
    this.query(statement)
  }

  cancelQuery() {
    this.query('')
  }

  async onEditorKeyDown(event) {
    if (event.code === 'F8') {
      this.run()
    }
  }

  onSelectionChange(event) {
    this.textSelection = event
  }

  onStatementChange(event) {}

  /**
   * 另存为 SQL Model
   */
  saveAsModel() {
    this.modelComponent.createByExpression(this.statement)
  }

  async drop(event: CdkDragDrop<{ name: string }[]>) {
    const modelType = await firstValueFrom(this.modelType$)
    const dialect = await firstValueFrom(this.modelService.dialect$)
    const property = event.item.data
    if (event.previousContainer.id === 'list-measures') {
      this.editor.insert(modelType === MODEL_TYPE.XMLA ? property.name : measureFormatter(property.name))
    } else if (event.previousContainer.id === 'list-dimensions') {
      this.editor.insert(modelType === MODEL_TYPE.XMLA ? property.name : serializePropertyUniqueName(property, dialect))
    } else if (event.previousContainer.id === 'pac-model-entities') {
      this.editor.insert(modelType === MODEL_TYPE.XMLA ? property.name : serializeUniqueName(property.name))
    } else {
      console.log(event.previousContainer.id)
    }
  }

  dropTable(event: CdkDragDrop<{ name: string }[]>) {
    const text = event.item.data?.name
    if (text) {
      this.query(`SELECT * FROM ${text}`)
    }
  }

  entityDeletePredicate(item: CdkDrag<EntitySchemaNode>) {
    return item.data.type === EntitySchemaType.Entity
  }

  triggerFormat() {
    this.editor.formatDocument()
  }

  triggerCompress() {
    this.editor.compressDocument()
  }

  triggerClear() {
    this.editor.clearDocument()
  }

  triggerFind() {
    this.editor.startFindAction()
  }
}

/**
 * 根据 SQL 查询结果对象分析出字段类型
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
 *
 * @param obj
 * @returns
 */
export function typeOfObj(obj) {
  return Object.entries(obj).map(([key, value]) => ({
    name: key,
    type: value === null || value === undefined ? null : typeof value
  }))
}
