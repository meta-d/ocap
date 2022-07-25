import { SelectionChange } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { NgmAppearance } from '@metad/ocap-angular/core'
import {
  AggregationRole,
  C_MEASURES,
  DataSettings,
  DisplayBehaviour,
  FlatNode,
  getPropertyCaption,
  hierarchize,
  PivotColumn,
  TreeNodeInterface,
  wrapBrackets
} from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import isNil from 'lodash/isNil'
import { of } from 'rxjs'
import { map, shareReplay, withLatestFrom } from 'rxjs/operators'
import { NgmAnalyticsBusinessService } from './analytics.service'

export interface AnalyticalGridOptions {
  showToolbar?: boolean
  strip?: boolean
  grid?: boolean
  paging?: boolean
  pageSize?: number
  sticky?: boolean
}

export interface PivotColumnFlatNode {
  name: string
  label: string
  level: number
  expandable: boolean
  colspan: number
  columns: PivotColumn[]
  isCell?: boolean
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-analytical-grid',
  templateUrl: 'analytical-grid.component.html',
  styleUrls: ['analytical-grid.component.scss'],
  host: { class: 'ngm-analytical-grid' },
  providers: [NgmAnalyticsBusinessService]
})
export class AnalyticalGridComponent<T> implements OnInit, OnChanges, AfterViewInit {
  AggregationRole = AggregationRole

  @Input() title: string
  @Input() dataSettings: DataSettings
  @Input() options: AnalyticalGridOptions
  @Input() appearance: NgmAppearance

  @ViewChild(MatPaginator)
  set paginator(v: MatPaginator) {
    this.dataSource.paginator = v
  }
  @ViewChild(MatSort) sort: MatSort

  dataSource = new MatTableDataSource<unknown>()
  selected = {
    i: null,
    j: null
  }

  treeNodePadding = 16
  rows = []
  treeDisplayedColumns = []
  displayedColumns = []
  matRowColumns = []
  pivotColumnLevels = 0
  pivotColumns = []
  rowTreeProperty = null

  public readonly isLoading$ = this.analyticsService.loading$ //.pipe(map(() => true))
  public readonly error$ = this.analyticsService.selectResult().pipe(map((result) => result.error))

  public readonly rows$ = this.analyticsService.analytics$.pipe(
    map((analytics) => {
      return analytics.rows
        .map((column: any) => {
          column.name = column.dimension === C_MEASURES ? wrapBrackets(C_MEASURES) : column.property?.name
          column.label =
            column.label || column.dimension === C_MEASURES ? C_MEASURES : column.property?.label ?? column.name
          column.caption =
            column.caption || column.dimension === C_MEASURES
              ? '[Measures]_Text'
              : column.property
              ? getPropertyCaption(column.property)
              : column.name
          column.displayBehaviour = column.displayBehaviour ?? DisplayBehaviour.descriptionOnly
          return column
        })
        .filter((column) => !isNil(column?.name))
    }),
    untilDestroyed(this),
    shareReplay(1)
  )

  public columnTreeControl = new FlatTreeControl<PivotColumnFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  )
  public readonly columnsDataSource = new MatTreeFlatDataSource(
    this.columnTreeControl,
    new MatTreeFlattener(
      (node: TreeNodeInterface<PivotColumn>, level: number): PivotColumnFlatNode => {
        return {
          expandable: node.raw.childrenCardinality > 0,
          name: node.raw.name,
          label: node.label,
          level: level,
          colspan: node.raw.columns?.length || 1,
          columns: node.raw.columns
        }
      },
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children
    ),
    []
  )

  public rowTreeControl = new FlatTreeControl<FlatNode<T>>(
    (node) => node.level,
    (node) => node.expandable
  )
  public readonly rowDataSource = new MatTreeFlatDataSource(
    this.rowTreeControl,
    new MatTreeFlattener(
      (node: TreeNodeInterface<T>, level: number): FlatNode<T> => {
        return {
          ...(node.raw ?? node),
          expandable: node.children?.length > 0,
          key: node.name,
          name: node.name,
          label: node.label,
          level: level
        }
      },
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children
    ),
    []
  )

  constructor(public analyticsService: NgmAnalyticsBusinessService<unknown>, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.analyticsService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.refresh()
      })

    this.analyticsService
      .selectResult()
      .pipe(untilDestroyed(this), withLatestFrom(this.rows$))
      .subscribe(([{ data, schema }, rows]: any) => {
        if (schema?.recursiveHierarchy) {
          this.rowTreeProperty = schema.rowHierarchy
          const compositeKeys = rows
            .map((row) => row.name)
            .filter((key) => key !== schema.recursiveHierarchy.valueProperty)
          this.rowDataSource.data = hierarchize<T>(data as T[], schema.recursiveHierarchy, { compositeKeys })
        } else {
          this.rowTreeProperty = null
          this.rowDataSource.data = data as TreeNodeInterface<T>[]
        }
      })

    this.analyticsService
      .selectResult()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        const treeDataNodes = result.schema?.columns ? hierarchize(result.schema.columns, {
          valueProperty: 'uniqueName',
          parentNodeProperty: 'parentUniqueName',
          labelProperty: 'label'
        }) : []
        this.columnsDataSource.data = treeDataNodes
      })

    this.columnTreeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<PivotColumnFlatNode>).added ||
        (change as SelectionChange<PivotColumnFlatNode>).removed
      ) {
        this.handleColumnTreeControl(change as SelectionChange<PivotColumnFlatNode>)
      }
    })

    this.columnsDataSource
      .connect({ viewChange: of() })
      .pipe(untilDestroyed(this), withLatestFrom(this.rows$))
      .subscribe(([columns, analyticsRows]) => {
        const levels = [[]]
        columns.forEach((pivotCol) => {
          let pivotcolspan = 0
          let isCell
          if (pivotCol.columns?.length) {
            levels[1] = levels[1] ?? []
            pivotCol.columns.forEach((subCol) => {
              let colspan = 1
              if (subCol.columns?.length) {
                levels[2] = levels[2] ?? []
                levels[2].push(...subCol.columns.map((col) => ({ ...col, colspan: 1, isCell: true })))
                colspan = subCol.columns.length
              } else {
                subCol.isCell = true
              }
              levels[1].push({
                ...subCol,
                colspan
              })
              pivotcolspan += colspan
            })
          } else {
            pivotcolspan = 1
            isCell = true
          }

          pivotCol.colspan = pivotcolspan
          pivotCol.isCell = isCell
          levels[0].push(pivotCol)
        })

        const pivotColumnNames = levels.map((item) => item.map((column) => column.name))
        this.rows = analyticsRows
        this.pivotColumns = levels
        const rowColumns = analyticsRows.map((row) => row.name)
        // 首行列
        this.treeDisplayedColumns = [...rowColumns, ...pivotColumnNames[0]]
        // 其余行列
        this.displayedColumns = pivotColumnNames.slice(1)
        // 列的总行数
        this.pivotColumnLevels = pivotColumnNames.length
        // body 行的列
        this.matRowColumns = [...rowColumns, ...pivotColumnNames[pivotColumnNames.length - 1]]

        this.cdr.detectChanges()
      })
  }

  ngOnChanges({ dataSettings }: SimpleChanges) {
    if (dataSettings?.currentValue) {
      this.analyticsService.dataSettings = dataSettings.currentValue
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort
  }

  refresh() {
    this.analyticsService.refresh()
  }

  selectRow(i: number) {
    this.selected.i = i
  }
  selectCell(j: number) {
    this.selected.j = j
  }

  toggleColumnTree(column: PivotColumnFlatNode) {
    const member = this.columnTreeControl.dataNodes.find((item) => item.name === column.name)
    this.columnTreeControl.toggle(member)
  }

  handleColumnTreeControl(change: SelectionChange<PivotColumnFlatNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true))
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false))
    }
  }

  toggleNode(node: PivotColumnFlatNode, expand: boolean) {
    // console.log(node, expand)
    // 待开发
  }

  @HostBinding('class.striped')
  get _isStriped() {
    return this.options?.strip
  }

  @HostBinding('class.ngm-with-toolbar')
  get _withToolbar() {
    return this.options?.showToolbar
  }
}
