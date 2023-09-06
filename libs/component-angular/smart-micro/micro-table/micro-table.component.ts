import { SelectionModel } from '@angular/cdk/collections'
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { convertPropertyToTableColumn, TableColumn } from '@metad/core'
import { Dimension, EntitySchema, EntityType, getEntityProperty, isDimension, Property, PropertyPath } from '@metad/ocap-core'
import { isNil } from 'lodash-es'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { catchError, debounceTime, filter, map, shareReplay } from 'rxjs/operators'

export declare interface NxMicroTableOptions {
  columns?: {
    [key: string]: TableColumn
  }
  paging?: boolean
  pageSizeOptions?: number[]
}

@UntilDestroy()
@Component({
  selector: 'nx-micro-table',
  templateUrl: './micro-table.component.html',
  styleUrls: ['./micro-table.component.scss'],
  host: {
    class: 'nx-micro-table'
  }
})
export class NxMicroTableComponent implements OnInit, AfterViewInit {

  @Input() get data(): Array<any> {
    return this._data$.getValue()
  }
  set data(value) {
    this._data$.next(value)
  }
  private _data$ = new BehaviorSubject<any[]>(null)

  @Input() get schema(): EntitySchema {
    return this._schema$.getValue()
  }
  set schema(value) {
    this._schema$.next(value)
  }
  private _schema$ = new BehaviorSubject<EntitySchema>(null)

  @Input() get entityType(): EntityType {
    return this._entityType$.getValue()
  }
  set entityType(value) {
    this._entityType$.next(value)
  }
  private _entityType$ = new BehaviorSubject<EntityType>(null)

  @Input() options: NxMicroTableOptions

  @Output() selectedChange = new EventEmitter()

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort

  dataSource = new MatTableDataSource<any>()

  readonly columnDefs$: Observable<Array<TableColumn>> = combineLatest([
    this._schema$.pipe(filter((data) => !isNil(data))),
    this._entityType$.pipe(filter((data) => !isNil(data)))
  ]).pipe(
    debounceTime(0),
    map(([schema, entityType]) => {
      return [...schema.rows, ...schema.columns]
        .map((property: Property) => {
          property = getEntityProperty(entityType, {dimension: property.name})
          // const property = getEntityProperty(entityType, column)
          if (property) {
            const tableColumn = convertPropertyToTableColumn({dimension: property.name}, property)
            // if (isDimension(column)) {
              // tableColumn.displayBehaviour = column.displayBehaviour
            // }
            return tableColumn
          }
          return null
        })
        .filter((value) => !!value)
    }),
    map((columns) => {
      if (this.options?.columns) {
        return columns.filter(
          (column) => !this.options.columns[column.name] || !this.options.columns[column.name].hidden
        )
      }
      return columns
    }),
    catchError((err, caught) => {
      console.error(err)
      return of([])
    }),
    shareReplay(1)
  )

  readonly columns$: Observable<Array<string>> = this.columnDefs$.pipe(
    map((columnDefs) => {
      const columns = columnDefs.map((item) => item.name)
      return ['select', ...columns]
    }),
    shareReplay()
  )

  selection = new SelectionModel<any>(true, [])

  ngOnInit() {
    this.selection.changed
      .pipe(
        map((event) => event.source.selected),
        untilDestroyed(this)
      )
      .subscribe(this.selectedChange)

    this._data$.subscribe((data) => {
      this.dataSource.data = data || []
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
    // If the user changes the sort order, reset back to the first page.
    this.sort?.sortChange.subscribe((sort) => {
      // this.paginator.pageIndex = 0
    })
  }

  identify(index: number, item: TableColumn) {
    return item.property
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row))
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`
  }

}
