import { Component, effect, input, signal } from '@angular/core'
import { NgmDisplayBehaviourComponent, TableColumn } from '@metad/ocap-angular/common'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { MaterialModule, SharedModule } from 'apps/cloud/src/app/@shared'
import { findIndex, get } from 'lodash-es'
import { HierarchyTableDataType } from '../types'
import { serializeMemberCaption } from '@metad/ocap-sql'
import { DisplayBehaviour } from '@metad/ocap-core'

type LevelTableColumn = TableColumn & { captionName: string }

@Component({
  standalone: true,
  selector: 'ngm-hierarchy-table',
  templateUrl: 'hierarchy-table.component.html',
  styleUrls: ['hierarchy-table.component.scss'],
  host: {
    class: 'ngm-hierarchy-table'
  },
  providers: [],
  imports: [SharedModule, MaterialModule, NgmDisplayBehaviourComponent]
})
export class HierarchyTableComponent<T> {
  readonly columns = input<LevelTableColumn[], TableColumn[]>(null, {
    transform: (columns) => {
      return columns.map((column) => ({
        ...column,
        captionName: serializeMemberCaption(column.name)
      }))
    }
  })
  readonly data = input<HierarchyTableDataType<T>[]>()
  readonly displayDensity = input<DisplayDensity | string>()
  readonly displayBehaviour = input<DisplayBehaviour | string>(DisplayBehaviour.auto)

  readonly dataSource = signal([])
  readonly displayedColumns = signal<string[]>([])

  constructor() {
    effect(
      () => {
        this.dataSource.set(this.data())
        const root = this.data()[0]
        if (root.levelNumber === 0) {
          this.expandNode(root)
        }
      },
      { allowSignalWrites: true }
    )

    effect(
      () => {
        this.displayedColumns.set(['levelNumber', ...this.columns().map((column) => column.name), 'childrenCardinality'])
      },
      { allowSignalWrites: true }
    )
  }

  getValue(row: any, name: string) {
    return get(row, name)
  }

  /**
   * Toggle dimension member node expansion state
   */
  toggleNode(node: HierarchyTableDataType<T>) {
    if (node.expanded) {
      node.expanded = false
      this.dataSource.update((rows) => {
        // Close all children
        const fromIndex = rows.indexOf(node)
        const toIndex = findIndex(rows, (row) => row.levelNumber <= node.levelNumber, fromIndex + 1)
        rows.splice(fromIndex + 1, (toIndex > -1 ? toIndex : rows.length) - fromIndex - 1)
        return [...rows]
      })
    } else {
      this.expandNode(node)
    }
  }

  expandNode(node: HierarchyTableDataType<T>) {
    if (node.expanded) {
      return
    }
    node.expanded = true
    this.dataSource.update((rows) => {
      // Open children and set them to not expanded
      rows.splice(rows.indexOf(node) + 1, 0, ...node.children.map((child) => ({ ...child, expanded: false})))
      return [...rows]
    })
  }
}
