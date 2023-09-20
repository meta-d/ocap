import { Injectable, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PropertyDimension, PropertyHierarchy } from '@metad/ocap-core'
import { ComponentSubStore, DirtyCheckQuery } from '@metad/store'
import { NxSettingsPanelService } from '@metad/story/designer'
import { uuid } from 'apps/cloud/src/app/@core'
import { assign, cloneDeep, isNil } from 'lodash-es'
import { distinctUntilChanged, filter, map, Observable, of, switchMap, tap, withLatestFrom, shareReplay } from 'rxjs'
import { SemanticModelService } from '../model.service'
import { ModelDesignerType, ModelDimensionState, PACModelState } from '../types'
import { nonNullable } from '@metad/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'


@UntilDestroy()
@Injectable()
export class ModelDimensionService extends ComponentSubStore<ModelDimensionState, PACModelState> implements OnDestroy {
  private dirtyCheckQuery: DirtyCheckQuery = new DirtyCheckQuery(this, {
    watchProperty: ['dimension'],
    clean: (head, current) => {
      return of(true)
    }
  })
  public dirty$ = this.dirtyCheckQuery.isDirty$

  // Query
  public readonly dimension$ = this.select((state) => state.dimension).pipe(filter(nonNullable))
  public readonly name$ = this.dimension$.pipe(map((dimension) => dimension?.name), distinctUntilChanged())
  public readonly hierarchies$ = this.select(this.dimension$, (dimension) => dimension?.hierarchies)
  public readonly currentHierarchy$ = this.select((state) => state.currentHierarchy)

  public readonly dimEntityService$ = this.name$.pipe(
    filter((value) => !!value),
    switchMap((name) => this.modelService.selectOriginalEntityService(name)),
    shareReplay(1)
  )

  private isDirtySub = this.dirtyCheckQuery.isDirty$.pipe(takeUntilDestroyed()).subscribe((dirty) => {
    this.patchState({ dirty })
  })

  constructor(
    private modelService: SemanticModelService,
    private settingsService: NxSettingsPanelService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super({} as ModelDimensionState)

    this.dimension$.subscribe((dimension) => {
      if (this.modelService.originalDataSource) {
        // console.log(`update dimension shcema in DataSource`)
        const schema = this.modelService.originalDataSource.options.schema
        const dimensions = schema?.dimensions ? [...schema.dimensions] : []
        const index = dimensions.findIndex((item) => item.name === dimension.name)
        if (index > -1) {
          dimensions.splice(index, 1, dimension)
        } else {
          dimensions.push(dimension)
        }
        this.modelService.originalDataSource?.setSchema({
          ...schema,
          dimensions
        })
      }
    })
  }

  public init(id: string) {
    this.connect(this.modelService, { parent: ['dimensions', id] })
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dirtyCheckQuery.setHead()
        this.initHierarchyIndex()
      })

    this.modelService.saved$.pipe(untilDestroyed(this)).subscribe(() => {
      this.dirtyCheckQuery.setHead()
    })
  }

  /**
   * 初始化下级 Hierarchy 页面初始页(在初始化状态后立即执行)
   *
   * 如果有被设置 `currentHierarchyIndex` 则取相应的 Hierarchy, 否则取第一个
   */
  readonly initHierarchyIndex = this.updater((state) => {
    if (!isNil(state.currentHierarchyIndex)) {
      state.currentHierarchy = state.dimension.hierarchies[state.currentHierarchyIndex]
    } else {
      state.currentHierarchy = state.dimension.hierarchies?.[0]
    }
    this.navigateTo(state.currentHierarchy.__id__)
  })

  /**
   * 可以被下级页面调用设置当前 Hierarchy
   */
  public setCurrentHierarchy = this.updater((state, id: string) => {
    const index = state.dimension.hierarchies.findIndex((item) => item.__id__ === id)
    state.currentHierarchyIndex = index
  })

  public readonly newHierarchy = this.updater((state) => {
    const id = uuid()
    state.dimension.hierarchies.push({
      __id__: id,
      caption: `New Hierarchy`
    } as PropertyHierarchy)
    
    this.navigateTo(id)
  })

  public readonly removeHierarchy = this.updater((state, key?: string) => {
    const hierarchyIndex = key
      ? state.dimension.hierarchies.findIndex((item) => item.__id__ === key)
      : state.currentHierarchyIndex
    if (hierarchyIndex > -1) {
      state.dimension.hierarchies.splice(hierarchyIndex, 1)
    }

    // Navigate to the side one
    const index = hierarchyIndex > 0 ? hierarchyIndex - 1 : state.dimension.hierarchies.length - 1
    if (index > -1) {
      this.navigateTo(state.dimension.hierarchies[index].__id__)
    }
  })

  public readonly updateHierarchy = this.updater((state, hierarchy: PropertyHierarchy) => {
    const h = state.dimension.hierarchies.find((item) => item.__id__ === hierarchy.__id__)
    assign(h, hierarchy)
  })

  public readonly duplicateHierarchy = this.updater((state, key?: string) => {
    const h = state.dimension.hierarchies.find((item) => item.__id__ === key)
    const newHierarchy = cloneDeep(h)
    state.dimension.hierarchies.push({
      ...newHierarchy,
      __id__: uuid(),
      name: newHierarchy.name ? `${newHierarchy.name} copy` : 'Copy',
      caption: `${newHierarchy.caption ?? ''} Copy`,
    })
  })

  public readonly update = this.updater((state, d: PropertyDimension) => {
    assign(state.dimension, d)
  })

  readonly setupHierarchyDesigner = this.effect((origin$: Observable<string>) => {
    return origin$.pipe(
      withLatestFrom(this.dimension$),
      switchMap(([id, dimension]) => {
        const hierarchy = dimension.hierarchies?.find((item) => item.__id__ === id)
        return this.settingsService
          .openDesigner<{ modeling: PropertyHierarchy; dimension: PropertyDimension }>(
            ModelDesignerType.hierarchy,
            { modeling: hierarchy, dimension },
            id
          )
          .pipe(
            tap(({ modeling, dimension }) => {
              this.updateHierarchy({
                ...modeling,
                __id__: id
              })
              this.update(dimension)
            })
          )
      })
    )
  })

  navigateTo(id: string) {
    this.router.navigate([`hierarchy/${id}`], { relativeTo: this.route })
  }

  ngOnDestroy() {
    this.onDestroy()
  }
}
