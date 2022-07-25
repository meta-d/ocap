import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  DimensionMemberRecursiveHierarchy,
  EntityProperty,
  EntityType,
  getEntityDimensions,
  getEntityMeasures,
  hierarchize,
  IDimensionMember,
  isEntityType,
  PropertyDimension,
  PropertyHierarchy,
  TreeNodeInterface
} from '@metad/ocap-core'
import isEmpty from 'lodash/isEmpty'
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  first,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap
} from 'rxjs'

export enum EntitySchemaType {
  Entity = 'Entity',
  Dimension = 'Dimension',
  Hierarchy = 'Hierarchy',
  Level = 'Level',
  IMeasure = 'IMeasure',
  Member = 'Member'
}

export interface EntitySchemaNode extends EntityProperty {
  type?: EntitySchemaType
}

/** Flat node with expandable and level information */
export class EntitySchemaFlatNode {
  constructor(
    public item: EntitySchemaNode,
    public level = 1,
    public expandable = false,
    public isLoading = false,
    public children = null,
    public error = null
  ) {}
}

export class EntitySchemaDataSource implements DataSource<EntitySchemaFlatNode> {
  private destroy$ = new Subject<void>()
  dataChange = new BehaviorSubject<EntitySchemaFlatNode[]>([])

  get dataSourceName() {
    return this.dataSourceName$.value
  }
  set dataSourceName(value) {
    this.dataSourceName$.next(value)
  }
  private dataSourceName$ = new BehaviorSubject<string>(null)
  private dataSource$ = this.dataSourceName$.pipe(
    distinctUntilChanged(),
    filter((value) => !!value),
    switchMap((name) => this.dsCoreService.getDataSource(name)),
    takeUntil(this.destroy$),
    shareReplay(1)
  )
  private entity$ = new BehaviorSubject<string>(null)
  private entityService$ = this.entity$.pipe(
    distinctUntilChanged(),
    filter((value) => !!value),
    switchMap((name) => this.dataSource$.pipe(map((dataSource) => dataSource.createEntityService(name)))),
    takeUntil(this.destroy$),
    shareReplay(1)
  )

  get data(): EntitySchemaFlatNode[] {
    return this.dataChange.value
  }
  set data(value: EntitySchemaFlatNode[]) {
    this._treeControl.dataNodes = value
    this.dataChange.next(value)
  }

  private entityType: EntityType

  constructor(private _treeControl: FlatTreeControl<EntitySchemaFlatNode>, private dsCoreService: NgmDSCoreService) {}

  connect(collectionViewer: CollectionViewer): Observable<EntitySchemaFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<EntitySchemaFlatNode>).added ||
        (change as SelectionChange<EntitySchemaFlatNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<EntitySchemaFlatNode>)
      }
    })

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data))
  }
  disconnect(collectionViewer: CollectionViewer): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<EntitySchemaFlatNode>) {
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

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: EntitySchemaFlatNode, expand: boolean) {
    const index = this.data.indexOf(node)
    if (expand) {
      if (node.children) {
        this.data.splice(index + 1, 0, ...node.children)
        // notify the change
        this.dataChange.next(this.data)
      } else {
        node.isLoading = true
        this.getChildren(node).pipe(takeUntil(this.destroy$)).subscribe({
          next: (children) => {
            const index = this.data.indexOf(node)
            if (index < 0) {
              return
            }
            if (!children?.length) {
              // If no children, or cannot find the node, no op
              node.isLoading = false
              this.data.splice(index, 1, { ...node, expandable: false })
              this.dataChange.next(this.data)
              return
            }

            const nodes = children.map(
              (name) =>
                new EntitySchemaFlatNode(
                  name,
                  node.level + 1,
                  name.type === EntitySchemaType.Member
                    ? !!name.children?.length
                    : name.type === EntitySchemaType.IMeasure
                    ? false
                    : true
                )
            )
            this.data.splice(index + 1, 0, ...nodes)

            node.isLoading = false
            // notify the change
            this.dataChange.next(this.data)
          },
          error: (err) => {
            let error: string
            if (typeof err === 'string') {
              error = err
            } else if (err instanceof Error) {
              error = err?.message
            } else if (err?.error instanceof Error) {
              error = err?.error?.message
            } else {
              error = err
            }

            node.isLoading = false
            this.data.splice(index, 1, { ...node, expandable: false, error })
            // notify the change
            this.dataChange.next(this.data)
          }
        })
      }
    } else {
      let count = 0
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
        //
      }
      node.children = this.data.splice(index + 1, count)
      // notify the change
      this.dataChange.next(this.data)
    }
  }

  getChildren(node: EntitySchemaFlatNode): Observable<any[]> {
    if (node.item.type === EntitySchemaType.Entity) {
      if (this.entityType?.name === node.item.name) {
        return of(getEntityDimensions(this.entityType))
      }

      this.entity$.next(node.item.name)
      return this.dataSource$.pipe(
        switchMap((dataSource) => dataSource.selectEntityType(node.item.name)),
        first(),
        tap((entityType) => {
          if (entityType instanceof Error) {
            throw entityType
          }
          this.entityType = entityType
          node.item.label = this.entityType?.label
        }),
        filter(isEntityType),
        map((entityType: EntityType) => {
          const dimensions = getEntityDimensions(entityType)
          // dimensions.forEach((dimension) => (dimension.type = EntitySchemaType.Dimension))
          const measures = getEntityMeasures(entityType)
          // measures.forEach((item) => ((item as EntitySchemaNode).type = EntitySchemaType.IMeasure))
          return [...dimensions.map((item) => ({...item, type: EntitySchemaType.Dimension})), ...measures.map((item) => ({
            ...item,
            type: EntitySchemaType.IMeasure
          }))]
        })
      )
    } else if (node.item.type === EntitySchemaType.Dimension) {
      const item = node.item as PropertyDimension
      const hierarchies = item.hierarchies
      if (!isEmpty(hierarchies)) {
        // hierarchies.forEach((item: EntitySchemaNode) => {
        //   item.type = EntitySchemaType.Hierarchy
        // })
        return of(hierarchies.map((item) => ({
          ...item,
          type: EntitySchemaType.Hierarchy
        })))
      } else {
        return this.entityService$.pipe(
          switchMap((entityService) =>
            entityService.getMembers<EntitySchemaNode & IDimensionMember>({ dimension: node.item.name })
          ),
          first(),
          map((members) => {
            // members.forEach((item) => {
            //   item.type = EntitySchemaType.Member
            //   item.name = item.memberKey
            //   item.label = item.memberCaption
            // })
            return members.map((item) => ({
              ...item,
              type: EntitySchemaType.Member,
              name: item.memberKey,
              label: item.memberCaption
            }))
          })
        )
      }
    } else if (node.item.type === EntitySchemaType.Hierarchy) {
      const levels = (node.item as PropertyHierarchy).levels as EntitySchemaNode[]
      if (!isEmpty(levels)) {
        // levels.forEach((item) => {
        //   item.type = EntitySchemaType.Level
        // })
        return of(levels.map((item) => ({
          ...item,
          type: EntitySchemaType.Level
        })))
      }
    } else if (node.item.type === EntitySchemaType.Level) {
      const item = node.item as any
      return this.entityService$.pipe(
        switchMap((entityService) =>
          entityService.getMembers<IDimensionMember>({
            dimension: item.dimension,
            hierarchy: item.hierarchy,
            level: item.name
          })
        ),
        first(),
        map((members) => {
          const _members = hierarchize<IDimensionMember>(members, DimensionMemberRecursiveHierarchy, {
            startLevel: item.levelNumber
          })
          // _members.forEach((item: EntitySchemaNode & TreeNodeInterface<IDimensionMember>) => {
          //   item.type = EntitySchemaType.Member
          //   item.name = item.raw.memberUniqueName
          // })
          return _members.map((item) => ({
            ...item,
            type: EntitySchemaType.Member,
            name: item.raw.memberUniqueName
          }))
        })
      )
    } else if (node.item.type === EntitySchemaType.Member) {
      const members = (node.item as unknown as TreeNodeInterface<IDimensionMember>).children
      // members?.forEach((item: EntitySchemaNode & TreeNodeInterface<IDimensionMember>) => {
      //   item.type = EntitySchemaType.Member
      //   item.name = item.raw.memberUniqueName
      // })
      return of(members?.map((item) => ({
        ...item,
        type: EntitySchemaType.Member,
        name: item.raw.memberUniqueName
      })) ?? [])
    }

    return of([])
  }
}
