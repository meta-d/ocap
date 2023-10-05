import { SelectionModel } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { DisplayDensity, NgmAppearance, OcapCoreModule } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  filterTreeNodes,
  hierarchize,
  IDimensionMember,
  PrimitiveType,
  TreeNodeInterface,
  TreeSelectionMode,
  FlatTreeNode,
  ISlicer,
  IMember
} from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { BehaviorSubject, Observable } from 'rxjs'
import { combineLatestWith, debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators'
import { NgmSmartFilterService } from '../smart-filter.service'
import { TreeControlOptions } from '../types'
import { CommonModule } from '@angular/common'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { MatIconModule } from '@angular/material/icon'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'

export interface TreeItemFlatNode<T> extends FlatTreeNode<T> {
  checked?: boolean
}

export interface MemberTreeState {
  options?: TreeControlOptions
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-member-tree',
  templateUrl: 'member-tree.component.html',
  styleUrls: ['member-tree.component.scss'],
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmMemberTreeComponent)
    }
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ScrollingModule,
    OcapCoreModule,
    NgmCommonModule,
  ]
})
export class NgmMemberTreeComponent<T extends IDimensionMember = IDimensionMember>
  extends ComponentStore<MemberTreeState>
  implements OnInit, OnChanges, ControlValueAccessor
{
  @HostBinding('class.ngm-member-tree') _isMemberTreeComponent = true
  // private dsCoreService? = inject(NgmDSCoreService, { optional: true })
  
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
  @Input() appearance: NgmAppearance
  @Input() disabled: boolean

  @Output() loadingChanging = new EventEmitter<boolean>()
  @Output() change = new EventEmitter<MatCheckboxChange>()

  itemSize = 40
  treeNodePaddingIndent = 20
  unfold = false
  searchControl = new FormControl()
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNodeInterface<T>, TreeItemFlatNode<T>>()
  keyNodeMap = new Map<PrimitiveType, TreeItemFlatNode<T>>()
  treeControl: FlatTreeControl<TreeItemFlatNode<T>>
  treeFlattener: MatTreeFlattener<TreeNodeInterface<T>, TreeItemFlatNode<T>>
  dataSource: MatTreeFlatDataSource<TreeNodeInterface<T>, TreeItemFlatNode<T>>
  /** The selection for checklist */
  private selectionModel$ = new BehaviorSubject(new SelectionModel<PrimitiveType>(false, []))
  get selectionModel() {
    return this.selectionModel$.value
  }

  public readonly options$ = this.select((state) => state.options)
  public readonly onlyLeaves$ = this.options$.pipe(map((options) => options?.onlyLeaves), distinctUntilChanged())
  public readonly loading$ = this.smartFilterService.loading$

  readonly slicer = toSignal(this.selectionModel$.pipe(switchMap((selectionModel) => selectionModel.changed)).pipe(
    map(() => {
      const selected = this.selectionModel.selected
      let nodes = selected.map((value) => this.keyNodeMap.get(value)).filter(Boolean)
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

      const slicer: ISlicer = {
        dimension: this.dimension,
        members: nodes.map((node) => ({
          value: node.key,
          key: node.key,
          caption: node.caption
        } as IMember))
      }
      return slicer
    }),
  ))

  onChange: (input: any) => void

  // Subscribers
  private _membersSub = this.smartFilterService.membersWithSchema$
    .pipe(
      combineLatestWith(this.onlyLeaves$),
      map(([{ members, schema }, onlyLeaves]) => {
        if (schema?.recursiveHierarchy) {
          return hierarchize(members, schema?.recursiveHierarchy, {onlyLeaves})
        }
        return null
      }),
      tap((treeNodes) => {
        if (treeNodes[0] && this.options?.autoActiveFirst && this.selectionModel.isEmpty()) {
          this.selectionModel.select(treeNodes[0].key)
        }
      }),
      combineLatestWith(this.searchControl.valueChanges.pipe(startWith(null), distinctUntilChanged())),
      map(([treeNodes, text]) => {
        text = text?.trim()
        if (text) {
          return filterTreeNodes(treeNodes, text, {considerKey: this.displayBehaviour !== DisplayBehaviour.descriptionOnly})
        }
        return treeNodes
      }),
      takeUntilDestroyed()
    )
    .subscribe((data) => {
      if (data) {
        this.dataSource.data = data as any
        // 初始化数据后展开初始层级深度
        if (this.options?.initialLevel > 0 || !!this.searchControl.value) {
          this.treeControl.dataNodes.forEach((node) => {
            const level = this.treeControl.getLevel(node)
            if (level < this.options.initialLevel || (this.searchControl.value && node.childrenCardinality === 1)) {
              this.treeControl.expand(node)
            }
          })
        }
      }
    })
  
  private _refreshSub = this.smartFilterService
    .onAfterServiceInit()
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.smartFilterService.refresh()
    })
  private _loadingSub = this.smartFilterService.loading$.pipe(takeUntilDestroyed()).subscribe((loading) => {
    this.loadingChanging.emit(loading)
  })

  constructor(private smartFilterService: NgmSmartFilterService) {
    super({})

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren)
    this.treeControl = new FlatTreeControl<TreeItemFlatNode<T>>(this.getLevel, this.isExpandable, {
      trackBy: (dataNode: TreeItemFlatNode<T>) => dataNode.key as any
    })
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
    this.dataSource.data = []
  }

  ngOnInit() {
    // this.onSelectionChange(this.checklistSelection)
  }

  ngOnChanges({ dataSettings, dimension, options, appearance }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.smartFilterService.options = { ...(this.options ?? {}), dimension: dimension.currentValue }
    }
    if (options?.currentValue) {
      this.smartFilterService.options = { ...options.currentValue, dimension: this.dimension }

      if (this.selectionModel.isMultipleSelection()) {
        if (options.currentValue.selectionType !== FilterSelectionType.Multiple) {
          // this.checklistSelection = new SelectionModel<PrimitiveType>(false, [])
          // this.onSelectionChange(this.checklistSelection)
          this.selectionModel$.next(new SelectionModel<PrimitiveType>(false, []))
        }
      } else if (options.currentValue.selectionType === FilterSelectionType.Multiple) {
        // this.checklistSelection = new SelectionModel<PrimitiveType>(true, [])
        // this.onSelectionChange(this.checklistSelection)
        this.selectionModel$.next(new SelectionModel<PrimitiveType>(true, []))
      }

      if (options.currentValue.defaultMembers) {
        this.selectionModel.select(...options.currentValue.defaultMembers.map((member) => member.value))
      }
    }

    if (appearance?.currentValue) {
      switch(this.appearance.displayDensity) {
        case DisplayDensity.compact:
          this.itemSize = 24
          this.treeNodePaddingIndent = 12
          break
        case DisplayDensity.cosy:
          this.itemSize = 30
          this.treeNodePaddingIndent = 15
          break
        default:
          this.itemSize = 40
          this.treeNodePaddingIndent = 20
      }
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      this.selectionModel.clear()
      if (obj.members) {
        this.selectionModel.select(...obj.members.map(({ value }) => value))
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
    /**
     * Emit default values
     * @todo Whether it is appropriate or not emit in here ？
     */
    if (this.options?.defaultMembers?.length) {
      this.onChange({
        dimension: this.dimension,
        members: [...this.options.defaultMembers]
      })
    }
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  refresh(force?: boolean) {
    this.smartFilterService.refresh(force)
  }

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeNodeInterface<T>, level: number) => {
    const existingNode = this.nestedNodeMap.get(node)
    const flatNode = existingNode &&
      existingNode.key === node.key ? existingNode : {} as TreeItemFlatNode<T>
    flatNode.key = node.key
    flatNode.raw = node.raw
    flatNode.caption = node.caption
    flatNode.level = level
    flatNode.expandable = !!node.children?.length
    flatNode.childrenCardinality = node.children?.length

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
    return this.selectionModel.isSelected(row.memberKey)
  }

  itemSelectionToggle(node: TreeItemFlatNode<T>, event: MatCheckboxChange) {
    const member = node.raw.memberKey
    this.selectionModel.toggle(member)
    const level = this.treeControl.getLevel(node)

    if (
      this.options?.treeSelectionMode === TreeSelectionMode.ChildrenOnly ||
      this.options?.treeSelectionMode === TreeSelectionMode.SelfChildren
    ) {
      const children = this.treeControl
        .getDescendants(node)
        .filter((node) => node.level === level + 1)
        .map((node) => node.raw.memberKey)

      this.selectionModel.isSelected(member)
        ? this.selectionModel.select(...children)
        : this.selectionModel.deselect(...children)
    } else if (
      this.options?.treeSelectionMode === TreeSelectionMode.SelfDescendants ||
      this.options?.treeSelectionMode === TreeSelectionMode.DescendantsOnly
    ) {
      const descendants = this.treeControl
        .getDescendants(node)
        .map((node) => node.raw.memberKey)
      this.selectionModel.isSelected(member)
        ? this.selectionModel.select(...descendants)
        : this.selectionModel.deselect(...descendants)
    } else {
      // TreeSelectionMode.Individual
      // this.checklistSelection.toggle(member)
    }

    this.onChange(this.slicer())
  }

  // readonly onSelectionChange = this.effect((selection$: Observable<SelectionModel<PrimitiveType>>) => {
  //   return selection$.pipe(
  //     switchMap((selection) => selection.changed),
  //     filter(() => !isEmpty(this.treeControl.dataNodes)),
  //     // 防止连续 clear+select 导致的空 members
  //     debounceTime(100),
  //     map(() => this.selectionModel.selected),
  //     tap((selected: Array<PrimitiveType>) => {
  //       let nodes = selected.map((value) => this.keyNodeMap.get(value)).filter(Boolean)
  //       if (this.options?.treeSelectionMode === TreeSelectionMode.ChildrenOnly) {
  //         nodes = nodes.filter(
  //           (node) =>
  //             !this.treeControl.isExpandable(node) ||
  //             !(this.childrenPartiallySelected(node) || this.childrenAllSelected(node))
  //         )
  //       } else if (this.options?.treeSelectionMode === TreeSelectionMode.DescendantsOnly) {
  //         nodes = nodes.filter(
  //           (node) =>
  //             !this.treeControl.isExpandable(node) ||
  //             !(this.descendantsPartiallySelected(node) || this.descendantsAllSelected(node))
  //         )
  //       }

  //       const slicer: ISlicer = {
  //         dimension: this.dimension,
  //         members: nodes.map((node) => ({
  //           value: node.key,
  //           key: node.key,
  //           caption: node.caption
  //         } as IMember))
  //       }
  //       // this.onChange?.(slicer)
  //     })
  //   )
  // })

  toggleExpand() {
    this.unfold = !this.unfold
    this.unfold ? this.treeControl.expandAll() : this.treeControl.collapseAll()
  }
}
