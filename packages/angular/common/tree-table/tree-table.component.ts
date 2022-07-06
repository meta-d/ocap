import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { Property, TreeNodeInterface } from '@metad/ocap-core'

export interface FlatNode<T> {
  expandable: boolean
  name: string
  label: string
  value: number
  level: number
  raw?: T
}

@Component({
  selector: 'ngm-tree-table',
  templateUrl: 'tree-table.component.html',
  styleUrls: ['tree-table.component.scss']
})
export class TreeTableComponent<T> implements OnInit, OnChanges {
  @Input() data: TreeNodeInterface<T>[]
  @Input() columns: Property[]
  @Input() nameLabel: string
  @Input() displayDensity: DisplayDensity
  @Input() get striped() {
    return this._striped
  }
  set striped(value) {
    this._striped = coerceBooleanProperty(value)
  }
  private _striped = false

  @Input() get grid() {
    return this._grid
  }
  set grid(value) {
    this._grid = coerceBooleanProperty(value)
  }
  private _grid = false 

  treeNodePadding = 40
  displayedColumns = ['name']

  private transformer = (node: TreeNodeInterface<T>, level: number): FlatNode<T> => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      label: node.label,
      value: node.value,
      level: level,
      raw: node.raw
    }
  }

  treeControl = new FlatTreeControl<FlatNode<T>>(
    (node) => node.level,
    (node) => node.expandable
  )

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  )

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)

  constructor() {}

  ngOnInit() {}

  ngOnChanges({ data, columns, displayDensity }: SimpleChanges): void {
    if (data?.currentValue) {
      this.dataSource.data = this.data
    }

    if (columns?.currentValue) {
      this.displayedColumns = ['name', ...columns.currentValue.map((column) => column.name)]
    }

    if (displayDensity) {
      if (displayDensity.currentValue === DisplayDensity.compact) {
        this.treeNodePadding = 24
      } else if (displayDensity.currentValue === DisplayDensity.cosy) {
        this.treeNodePadding = 30
      } else {
        this.treeNodePadding = 40
      }
    }
  }

  hasChild = (_: number, node: FlatNode<T>) => node.expandable
}
