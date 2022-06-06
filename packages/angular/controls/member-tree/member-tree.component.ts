import { SelectionModel } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, forwardRef, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import {
  DataSettings,
  Dimension,
  FilterSelectionType,
  getPropertyHierarchy,
  hierarchize,
  PrimitiveType,
  TreeNodeInterface,
  TreeSelectionMode
} from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import isEmpty from 'lodash/isEmpty'
import { Observable } from 'rxjs'
import { filter, map, switchMap, tap } from 'rxjs/operators'
import { NgmSmartFilterService } from '../smart-filter.service'
import { ControlOptions } from '../types'

export class TreeItemFlatNode<T> {
  key: string
  value: any
  raw: T
  label: string
  level: number
  expandable: boolean
  checked: boolean
}

export interface MemberTreeOptions extends ControlOptions {
  treeSelectionMode?: TreeSelectionMode
}

export interface MemberTreeState {
  // slicer: ISlicer
  options?: MemberTreeOptions
}

@UntilDestroy()
@Component({
  selector: 'ngm-member-tree',
  templateUrl: 'member-tree.component.html',
  styleUrls: ['member-tree.component.scss'],
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MemberTreeComponent)
    }
  ]
})
export class MemberTreeComponent<T>
  extends ComponentStore<MemberTreeState>
  implements OnInit, OnChanges, ControlValueAccessor
{
  @HostBinding('class.ngm-member-tree') _isMemberTreeComponent = true

  @Input() dataSettings: DataSettings
  @Input() dimension: Dimension
  @Input() get options() {
    return this.get((state) => state.options)
  }
  set options(value) {
    this.patchState({ options: value })
  }
  get displayBehaviour() {
    return this.dimension?.displayBehaviour
  }
  get treeSelectionMode() {
    return this.options?.treeSelectionMode
  }

  searchControl = new FormControl()
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNodeInterface<T>, TreeItemFlatNode<T>>()
  keyNodeMap = new Map<PrimitiveType, TreeItemFlatNode<T>>()
  treeControl: FlatTreeControl<TreeItemFlatNode<T>>
  treeFlattener: MatTreeFlattener<TreeNodeInterface<T>, TreeItemFlatNode<T>>
  dataSource: MatTreeFlatDataSource<TreeNodeInterface<T>, TreeItemFlatNode<T>>
  /** The selection for checklist */
  checklistSelection = new SelectionModel<PrimitiveType>(false, [])

  public readonly options$ = this.select((state) => state.options)

  onChange: (input: any) => void

  constructor(private smartFilterService: NgmSmartFilterService<T>) {
    super({})

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren)
    this.treeControl = new FlatTreeControl<TreeItemFlatNode<T>>(this.getLevel, this.isExpandable, {
      trackBy: (dataNode: TreeItemFlatNode<T>) => dataNode.value
    })
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
    this.dataSource.data = []
  }

  ngOnInit() {
    this.smartFilterService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.smartFilterService.refresh()
      })

    this.onSelectionChange(this.checklistSelection)

    this.smartFilterService
      .selectResult()
      .pipe(
        map(({ error, schema, data }) => {
          if (error) {
            return null
          }

          if (schema?.recursiveHierarchy) {
            return hierarchize(data, schema?.recursiveHierarchy)
          }

          return null
        }),
        untilDestroyed(this)
      )
      .subscribe((data) => {
        if (data) {
          console.log(data)
          this.dataSource.data = data
        }
      })
  }

  ngOnChanges({ dataSettings, dimension, options }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.smartFilterService.options = { dimension: dimension.currentValue }
    }
    if (options?.currentValue) {
      if (this.checklistSelection.isMultipleSelection()) {
        if (options.currentValue.selctionType !== FilterSelectionType.Multiple) {
          this.checklistSelection = new SelectionModel<PrimitiveType>(false, [])
          this.onSelectionChange(this.checklistSelection)
        }
      } else if (options.currentValue.selctionType === FilterSelectionType.Multiple) {
        this.checklistSelection = new SelectionModel<PrimitiveType>(true, [])
        this.onSelectionChange(this.checklistSelection)
      }
    }
  }

  writeValue(obj: any): void {
    if (obj?.members) {
      // this.patchState({ slicer: obj })
      this.checklistSelection.clear()
      this.checklistSelection.select(...obj.members.map(({ value }) => value))
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    //
  }

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeNodeInterface<T>, level: number) => {
    const existingNode = this.nestedNodeMap.get(node)
    const flatNode =
      existingNode &&
      existingNode.key === // [this.recursiveHierarchy.valueProperty] ===
        node.key // [this.recursiveHierarchy.valueProperty]
        ? existingNode
        : new TreeItemFlatNode<T>()
    flatNode.key = node.key // [this.recursiveHierarchy.valueProperty]
    flatNode.value = node.key
    flatNode.raw = node.raw
    flatNode.label = node.label // [this.recursiveHierarchy.labelProperty]
    flatNode.level = level
    flatNode.expandable = !!node.children?.length

    this.nestedNodeMap.set(node, flatNode)
    this.keyNodeMap.set(flatNode.key, flatNode)

    return flatNode
  }

  getLevel = (node: TreeItemFlatNode<T>) => node.level
  isExpandable = (node: TreeItemFlatNode<T>) => node.expandable
  getChildren = (node: TreeNodeInterface<any>): TreeNodeInterface<any>[] => node.children

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TreeItemFlatNode<T>): boolean {
    const descendants = this.treeControl.getDescendants(node)
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.isSelected(child.raw)
      })
    return descAllSelected
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeItemFlatNode<T>): boolean {
    const descendants = this.treeControl.getDescendants(node)
    const result = descendants.some((child) => this.isSelected(child.raw))
    return result && (!this.descendantsAllSelected(node) || !this.isSelected(node.raw))
  }

  childrenAllSelected(node: TreeItemFlatNode<T>): boolean {
    const level = this.treeControl.getLevel(node)
    const result = this.treeControl
      .getDescendants(node)
      .filter((node) => node.level === level + 1)
      .every((child) => this.isSelected(child.raw))
    return result
  }

  childrenPartiallySelected(node: TreeItemFlatNode<T>): boolean {
    const result = this.treeControl.getDescendants(node).some((child) => this.isSelected(child.raw))
    return result && (!this.childrenAllSelected(node) || !this.isSelected(node.raw))
  }

  isPartiallySelected(node: TreeItemFlatNode<T>): boolean {
    if (this.options?.treeSelectionMode === TreeSelectionMode.ChildrenOnly) {
      return this.childrenPartiallySelected(node)
    } else if (this.options?.treeSelectionMode === TreeSelectionMode.SelfChildren) {
      return this.childrenPartiallySelected(node)
    } else if (this.options?.treeSelectionMode === TreeSelectionMode.DescendantsOnly) {
      return this.descendantsPartiallySelected(node)
    } else if (this.options?.treeSelectionMode === TreeSelectionMode.SelfDescendants) {
      return this.descendantsPartiallySelected(node)
    }
    return false
  }

  isSelected(row: T) {
    return this.checklistSelection.isSelected(row[getPropertyHierarchy(this.dimension)])
  }

  itemSelectionToggle(node: TreeItemFlatNode<T>) {
    const member = node.raw[getPropertyHierarchy(this.dimension)]
    this.checklistSelection.toggle(member)
    const level = this.treeControl.getLevel(node)

    if (
      this.options?.treeSelectionMode === TreeSelectionMode.ChildrenOnly ||
      this.options?.treeSelectionMode === TreeSelectionMode.SelfChildren
    ) {
      const children = this.treeControl
        .getDescendants(node)
        .filter((node) => node.level === level + 1)
        .map((node) => node.raw[getPropertyHierarchy(this.dimension)])

      this.checklistSelection.isSelected(member)
        ? this.checklistSelection.select(...children)
        : this.checklistSelection.deselect(...children)
    } else if (
      this.options?.treeSelectionMode === TreeSelectionMode.SelfDescendants ||
      this.options?.treeSelectionMode === TreeSelectionMode.DescendantsOnly
    ) {
      const descendants = this.treeControl
        .getDescendants(node)
        .map((node) => node.raw[getPropertyHierarchy(this.dimension)])
      this.checklistSelection.isSelected(member)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants)
    } else {
      // TreeSelectionMode.Individual
      // this.checklistSelection.toggle(member)
    }
  }

  readonly onSelectionChange = this.effect((selection$: Observable<SelectionModel<PrimitiveType>>) => {
    return selection$.pipe(
      switchMap((selection) => selection.changed),
      filter(() => !isEmpty(this.treeControl.dataNodes)),
      map(() => this.checklistSelection.selected),
      tap((selected) => {
        let nodes = selected
          .map((value) => {
            const node = this.keyNodeMap.get(value)
            return node
          })
          .filter((node) => !!node)
        if (this.options?.treeSelectionMode === TreeSelectionMode.ChildrenOnly) {
          nodes = nodes.filter(
            (node) =>
              !this.treeControl.isExpandable(node) ||
              !(this.childrenPartiallySelected(node) || this.childrenAllSelected(node))
          )
        } else if (this.options?.treeSelectionMode === TreeSelectionMode.DescendantsOnly) {
          nodes = nodes.filter(
            (node) =>
              !this.treeControl.isExpandable(node) ||
              !(this.descendantsPartiallySelected(node) || this.descendantsAllSelected(node))
          )
        }

        const slicer = {
          dimension: this.dimension,
          members: nodes.map((node) => ({
            value: node.key,
            label: node.label
          }))
        }
        this.onChange?.(slicer)
      })
    )
  })
}
