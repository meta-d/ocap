import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatPaginator, MatPaginatorDefaultOptions, MatPaginatorIntl } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateService } from '@ngx-translate/core'
import get from 'lodash-es/get'
import { Subject } from 'rxjs'
import { TableColumn } from '../types'
import { DisplayDensity } from '@metad/ocap-angular/core'

@UntilDestroy()
@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>()

  constructor(private translateService: TranslateService) {
    this.translateService
      .stream('COMPONENTS.Table', {
        Default: {
          firstPageLabel: 'First page',
          itemsPerPageLabel: 'Items per page:',
          lastPageLabel: 'Last page',
          nextPageLabel: 'Next page',
          previousPageLabel: 'Previous page',
          rangeLabel0: 'Page 1 of 1',
          pageLabel: 'Page',
          ofLabel: 'of'
        }
      })
      .pipe(untilDestroyed(this))
      .subscribe((table) => {
        if (table) {
          this.firstPageLabel = table.firstPageLabel
          this.itemsPerPageLabel = table.itemsPerPageLabel
          this.lastPageLabel = table.lastPageLabel
          this.nextPageLabel = table.nextPageLabel
          this.previousPageLabel = table.previousPageLabel
          this.rangeLabel0 = table.rangeLabel0
          this.pageLabel = table.pageLabel
          this.ofLabel = table.ofLabel
        }
      })
  }

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = `First page`
  itemsPerPageLabel = `Items per page:`
  lastPageLabel = `Last page`

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Next page'
  previousPageLabel = 'Previous page'

  rangeLabel0 = `Page 1 of 1`
  pageLabel = 'Page'
  ofLabel = 'of'

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.rangeLabel0
    }
    const amountPages = Math.ceil(length / pageSize)
    return `${this.pageLabel} ${page + 1} ${this.ofLabel} ${amountPages}`
  }
}

@UntilDestroy({ checkProperties: true })
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-table',
  templateUrl: './table.component.html',
  styleUrls: [`table.component.scss`],
  host: {
    class: 'ngm-table'
  }
})
export class NxTableComponent implements OnChanges, AfterViewInit {
  @Input() columns: Array<TableColumn>
  @Input() get data(): Array<unknown> {
    return this._data
  }
  set data(value) {
    this._data = value
    this.dataSource.data = value ?? []
  }
  private _data

  @Input() get paging(): boolean {
    return this._paging
  }
  set paging(value: string | boolean) {
    this._paging = coerceBooleanProperty(value)
  }
  private _paging: boolean

  @Input() pageSizeOptions: MatPaginatorDefaultOptions['pageSizeOptions'] = [20, 50, 100]

  @Input() get grid() {
    return this._grid
  }
  set grid(value: string | boolean) {
    this._grid = coerceBooleanProperty(value)
  }
  private _grid = false

  @Input() get selectable() {
    return this._selectable
  }
  set selectable(value: string | boolean) {
    this._selectable = coerceBooleanProperty(value)
  }
  private _selectable = false

  @Input() displayDensity: DisplayDensity | string  = DisplayDensity.compact

  /**
   * A cell or row was selected.
   */
  // @Output() select: EventEmitter<any> = new EventEmitter()
  @Output() rowSelectionChanging = new EventEmitter<any[]>()

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort

  displayedColumns = []

  dataSource = new MatTableDataSource<any>()

  searchControl = new FormControl<string>('')
  searchingColumn = ''
  selection = new SelectionModel<any>(true, [])

  private _searchValueSub = this.searchControl.valueChanges.subscribe((value) => {
    this.dataSource.filter = value
  })
  constructor() {
    this.selection.changed.subscribe(() => this.rowSelectionChanging.emit(this.selection.selected))
  }

  ngOnChanges({ columns }: SimpleChanges): void {
    if (columns?.currentValue) {
      this.displayedColumns = columns.currentValue.map(({ name }) => name)
      if (this.selectable) {
        this.displayedColumns.unshift('select')
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
    // If the user changes the sort order, reset back to the first page.
    this.sort?.sortChange.subscribe((sort) => {
      this.paginator.pageIndex = 0
    })

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      // Transform the data into a lowercase string of all property values.
      const dataStr = ('' + data[this.searchingColumn]).toLowerCase()

      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformedFilter = filter.trim().toLowerCase()

      return dataStr.indexOf(transformedFilter) != -1
    }
  }

  _context(data: Record<string, unknown>, column: TableColumn) {
    return {
      ...data,
      $implicit: get(data, column.name)
    }
  }

  getValue(row: any, name: string) {
    return get(row, name)
  }

  escapeSearching(event) {
    if (event.key === 'Escape') {
      this.searchingColumn = ''
      this.searchControl.setValue('')
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear()
      return
    }

    this.selection.select(...this.dataSource.data)
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`
  }
}
