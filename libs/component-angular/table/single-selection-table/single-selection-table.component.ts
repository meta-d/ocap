import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import { Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { DisplayDensity } from '@metad/ocap-angular/core'
import get from 'lodash-es/get'

@Component({
  selector: 'ngm-single-selection-table',
  templateUrl: './single-selection-table.component.html',
  styleUrls: ['./single-selection-table.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxSingleSelectionTableComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxSingleSelectionTableComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() displayDensity: DisplayDensity | string = DisplayDensity.comfortable
  @Input() data: Array<any>
  @Input() columns: { value: string; label: string; cellTemplate?: TemplateRef<any> }[]
  @Input() get multiple() {
    return this._multiple
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value)
  }
  private _multiple = false

  @Input() get grid() {
    return this._grid
  }
  set grid(value: string | boolean) {
    this._grid = coerceBooleanProperty(value)
  }
  private _grid = false

  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatSort) sort: MatSort

  displayedColumns: string[]

  selection = new SelectionModel<any>(false, [])

  dataSource = new MatTableDataSource([])
  searchText: string = null
  /**
   * Invoked when the model has been changed
   */
  onChange: (_: any) => void = (_: any) => {}
  /**
   * Invoked when the model has been touched
   */
  onTouched: () => void = () => {}

  ngOnInit(): void {
    this.dataSource.data = this.data || []

    if (this.multiple) {
      this.selection = new SelectionModel<any>(true, [])
    }
    this.displayedColumns = ['select', ...this.columns.map(({ value }) => value)]
    this.selection.changed.subscribe(() => {
      if (this.multiple) {
        this.onChange(this.selection.selected)
      } else {
        this.onChange(this.selection.selected[0])
      }
    })
  }

  ngOnChanges({ data }: SimpleChanges): void {
    if (data) {
      this.dataSource.data = data.currentValue || []
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
    // If the user changes the sort order, reset back to the first page.
    this.sort?.sortChange.subscribe((sort) => {
      this.paginator.pageIndex = 0
    })
  }

  writeValue(obj: any): void {
    this.selection.select(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }

  _context(data: Record<string, unknown>, column) {
    return {
      ...data,
      $implicit: get(data, column.name), 
    }
  }

  onChangeRow(row) {
    this.selection.toggle(row)
  }
}
