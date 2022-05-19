import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { MatMenuTrigger } from '@angular/material/menu'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  ChartBusinessService,
  ChartOptions,
  ChartSettings,
  DataSettings,
  Dimension,
  Drill,
  getEntityHierarchy,
  getEntityLevel,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyName,
  IChartSelectedEvent,
  isAdvancedFilter,
  ISlicer,
  isSlicer,
  Property,
  propertyPath2Dimension,
  putFilter,
  SelectionVariant,
  slicerAsString
} from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import { ComponentStore } from '@metad/store'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { assign, cloneDeep, findIndex, isEmpty, isNil } from 'lodash'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { filter, map, shareReplay, tap, withLatestFrom } from 'rxjs/operators'

export interface DrillLevel {
  // 父级维度， 从哪个维度下钻来的
  parent: Dimension
  dimension: Dimension

  // level?: number
  slicer: ISlicer

  value?: any
  text?: string
  active?: boolean
}

export interface AnalyticalCardOptions {
  hideHeader?: boolean
  hideRefresh?: boolean
  hideLoading?: boolean
}

export interface AnalyticalCardState {
  dataSettings: DataSettings

  // 已下钻维度
  drilledDimensions: Array<DrillLevel>
  // 在已下钻维度列表中又选中部分维度
  selectedDrilledDimensions: Array<DrillLevel>
  // 当前选中的 Slicer
  selectedSlicers: ISlicer[]
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-analytical-card',
  templateUrl: './analytical-card.component.html',
  styleUrls: ['./analytical-card.component.scss']
})
export class AnalyticalCardComponent extends ComponentStore<AnalyticalCardState> implements OnInit, OnChanges {
  @Input() title: string
  /**
   * Data Settings
   */
  @Input() get dataSettings(): DataSettings {
    return this.get((state) => state.dataSettings)
  }
  set dataSettings(value) {
    this.patchState({
      dataSettings: value
    })
  }
  private _dataSettings$ = this.select((state) => state.dataSettings)

  @Input() chartSettings: ChartSettings
  @Input() chartOptions: ChartOptions

  @Input() options: AnalyticalCardOptions

  @Output() slicersChange = new EventEmitter<ISlicer[]>()

  @ViewChild('contextMenuTrigger') contextMenu: MatMenuTrigger
  contextMenuPosition = { x: '0px', y: '0px' }

  private businessService = new ChartBusinessService(this.dsCoreService)
  private echartsEngine = new SmartEChartEngine()
  readonly options$ = this.echartsEngine.selectChartOptions().pipe(map(({ options }) => options)) as any

  public readonly isLoading$ = this.businessService.loading$ // .pipe(map((loading) => true))

  public readonly error$ = new BehaviorSubject<string>(null)
  constructor(private dsCoreService: NgmDSCoreService, private _ngZone: NgZone) {
    super({} as AnalyticalCardState)
  }

  ngOnInit(): void {

    this.businessService.selectResult().pipe(
        filter(({ error }) => {
          if (error) {
            this.error$.next(error.message)
          } else {
            this.error$.next(null)
          }
          return !error
        }),
        withLatestFrom(this.businessService.chartAnnotation$),
        untilDestroyed(this)
      )
      .subscribe(([result, chartAnnotation]) => {
        this.echartsEngine.data = result
        this.echartsEngine.chartAnnotation = chartAnnotation
      })

    this.businessService
      .onAfterServiceInit()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.echartsEngine.entityType = this.businessService.getEntityType()
        this.refresh()
      })
    
    // DataSettings
    this.dataSettings$
      .pipe(
        filter((value) => !isNil(value)),
        untilDestroyed(this)
      )
      .subscribe((dataSettings) => {
        // this.echartsEngine.chartAnnotation = dataSettings?.chartAnnotation
        this.businessService.dataSettings = dataSettings
      })

    // ECharts Events
    this.echartsEngine.chartClick$.pipe(untilDestroyed(this)).subscribe((event) => {
      console.warn(event)
    })

    this.echartsEngine.selectChanged$.pipe(untilDestroyed(this)).subscribe((event: IChartSelectedEvent) => {
      this._ngZone.run(() => {
        this.openContextMenu(event.slicers, event.event)
      })
    })
  }

  ngOnChanges({ chartSettings, chartOptions }: SimpleChanges) {
    // if (dataSettings?.currentValue) {
    //   this.echartsEngine.chartAnnotation = dataSettings.currentValue.chartAnnotation
    //   this.businessService.dataSettings = dataSettings.currentValue
    //   // this.refresh()
    // }

    if (chartSettings) {
      this.echartsEngine.settings = chartSettings.currentValue
    }

    if (chartOptions) {
      this.echartsEngine.options = chartOptions.currentValue
    }
  }

  refresh() {
    this.businessService.refresh()
  }

  onChartInit(event) {
    this.echartsEngine.echarts = event
  }

  openContextMenu(slicers: ISlicer[], event?) {
    event?.stopPropagation()
    event?.preventDefault()

    // 设置当前选中过滤器
    this.patchState({ selectedSlicers: slicers })

    // 弹出菜单坐标
    if (event?.type === 'touchend') {
      this.contextMenuPosition.x = event.zrX + 50 + 'px'
      this.contextMenuPosition.y = event.zrY + 'px'
    } else {
      this.contextMenuPosition.x = event.offsetX + 50 + 'px'
      this.contextMenuPosition.y = event.offsetY + 'px'
    }

    this.contextMenu.menuData = { slicers }

    if (isEmpty(slicers)) {
      this.contextMenu.closeMenu()
      this.onLinkAnalysis([])
    } else {
      this.contextMenu.openMenu()
    }
  }

  onLinkAnalysis(slicers) {
    this.slicersChange.emit(slicers)
  }

  // For drill down
  readonly selectedDrilledDimensions$ = this.select((state) => state.selectedDrilledDimensions)
  readonly selectedSlicers$ = this.select((state) => state.selectedSlicers)
  readonly drilledDimensions$ = this.select((state) => state.drilledDimensions)
  readonly breadcrumbs$ = this.drilledDimensions$.pipe(
    map((drills) => {
      return drills?.map((item) => ({
        value: item,
        label: item.slicer.members[0].label || (item.slicer.members[0].value as string),
        active: true
      }))
    })
  )

  public readonly dillSlicers$ = this.selectedSlicers$.pipe(
    map((slicers) => {
      if (isAdvancedFilter(slicers?.[0])) {
        return slicers[0].children
      }
      return slicers
    }),
    withLatestFrom(this.businessService.entityType$),
    map(([slicers, entityType]) => {
      return slicers?.map((slicer) => {
        const property = getEntityProperty(entityType, slicer.dimension)
        return {
          value: slicer,
          label: (property.label || property.name) + ':' + slicerAsString(slicer)
        }
      })
    })
  )

  /**
   * 维度下钻
   * 1. 来自于 PresentationVariant 中的 groupBy
   * 2. disable 已被选中的下钻维度
   */
  public readonly drillDimensions$ = this.select(
    this.businessService.presentationVariant$,
    this.businessService.entityType$,
    this.selectedDrilledDimensions$,
    (presentationVariant, entityType, selectedDrilledDimensions) => {
      return presentationVariant?.groupBy?.map((item: Dimension) => ({
        dimension: item,
        property: getEntityProperty(entityType, getPropertyName(item)),
        disabled: !!selectedDrilledDimensions?.find(
          (selected) => getPropertyName(selected.dimension) === getPropertyName(item)
        )
      }))
    }
  )
    /**
   * 1. TODO 暂时取 chartAnnotation 中所有的 dimensions 维度
   * 2. disable 级别数小于已选中层级的维度
   */
    public readonly drillLevels$ = combineLatest([
      this._dataSettings$,
      this.businessService.entityType$,
      // this.selectedDrilledDimensions$,
      this.select((state) => state.selectedSlicers),
    ]).pipe(map(([dataSettings, entityType, selectedSlicers]) => {
        const chartAnnotation = dataSettings.chartAnnotation
        return chartAnnotation.dimensions
          .map((dimension) => {
            return {
              dimension,
              hierarchy: getEntityHierarchy(entityType, dimension)
            }
          })
          .filter(({ hierarchy }) => hierarchy?.levels)
          .map(({ dimension, hierarchy }) => {

            const selectedSlicer = selectedSlicers[0]

            const slicer = isAdvancedFilter(selectedSlicer) ? selectedSlicer.children?.find(slicer => slicer.dimension.dimension === dimension.dimension) :
              selectedSlicer
              // isArray(selectedSlicers) ? selectedSlicers.find(slicer => slicer.dimension.dimension === dimension.dimension) : selectedSlicers
            
            console.log(dimension, selectedSlicers, slicer)

            const slicerLevel = getEntityLevel(entityType, slicer?.dimension)
            return {
              slicer,
              property: hierarchy,
              levels: hierarchy.levels.map((level) => ({
                property: level,
                disabled: level.levelNumber <= (slicerLevel?.levelNumber || 0)
              }))
            }
          })
          .filter(({ slicer }) => !!slicer)
      }
    ),
    shareReplay(1)
  )
  public readonly canDrillLevels$ = this.drillLevels$.pipe(map(levels => !isEmpty(levels)))
  public readonly canDrillDimensions$ = this.drillDimensions$.pipe(map((drillDimensions) => !isEmpty(drillDimensions)))

  /**
   * 最终的数据设置
   */
  readonly dataSettings$ = combineLatest([this._dataSettings$, this.selectedDrilledDimensions$]).pipe(
    filter(([dataSettings]) => !isNil(dataSettings)),
    map(([dataSettings, selectedHierachyLevels]) => {
      console.log(`合并最终的数据设置:`, dataSettings, selectedHierachyLevels)

      const chartAnnotation = dataSettings.chartAnnotation
      // const filters = selectOptions?.map(option => convertSelectedMembers2Filter(option.selectedMemberOptions))
      // if (filters) {
      //   dataSettings.selectionVariant = {
      //     ...(dataSettings.selectionVariant || {}),
      //     selectOptions: filters
      //   }
      // }

      if (isEmpty(selectedHierachyLevels)) {
        return dataSettings
      }

      // 每次都 clone chartAnnotation 防止重复修改
      const _chartAnnotation = cloneDeep(chartAnnotation)
      const selectionVariant = dataSettings.selectionVariant ?? ({} as SelectionVariant)
      let selectOptions = selectionVariant.selectOptions || []
      selectedHierachyLevels.forEach((item) => {
        selectOptions = putFilter(selectOptions as ISlicer[], item.slicer)
      })

      const dimensions = _chartAnnotation.dimensions
      selectedHierachyLevels.forEach((item) => {
        const index = findIndex(dimensions, (o) => getPropertyName(o) === getPropertyName(item.parent))
        dimensions.splice(index, 1, item.dimension)
      })

      return assign(cloneDeep(dataSettings), {
        chartAnnotation: {
          ..._chartAnnotation,
          dimensions
        },
        selectionVariant: {
          ...selectionVariant,
          selectOptions
        }
      })
    }),
    shareReplay(1)
  )

  readonly drill = this.updater((state, drillLevel: DrillLevel) => {
    state.selectedDrilledDimensions = state.selectedDrilledDimensions || []
    state.drilledDimensions = state.drilledDimensions || []
    state.drilledDimensions = [...state.selectedDrilledDimensions, drillLevel]

    state.selectedDrilledDimensions = [...state.drilledDimensions]
  })

  readonly reselectDrill = this.updater((state, drillLevels: any[]) => {
    state.selectedDrilledDimensions = drillLevels.map(({ value }) => value)
  })

  readonly drillLevel = this.effect((origin$: Observable<{slicer: ISlicer, property: Property }>) => {
    return origin$.pipe(
      withLatestFrom(this.businessService.entityType$),
      tap(([{slicer, property}, entityType]) => {
        if (isAdvancedFilter(slicer)) {
          const parentFilter = slicer.children.find(
            (item) => getPropertyHierarchy(item.dimension) === property.hierarchyLevelFor
          )
          parentFilter.drill = Drill.Children
          this.drill({
            parent: parentFilter.dimension,
            slicer: parentFilter,
            dimension: propertyPath2Dimension(property.name, entityType)
          })
        } else {
          this.drill({
            parent: slicer.dimension,
            slicer: {
              ...slicer,
              drill: Drill.Children
            },
            dimension: propertyPath2Dimension(property.name, entityType)
          })
        }
    
        this.contextMenu.closeMenu()
      })
    )
  })

  public readonly dilldown$ = this.selectedSlicers$.pipe(map(selectedSlicers => {
    return isSlicer(selectedSlicers[0]) ? selectedSlicers[0] : null
  }))
  
  readonly drillDown = this.updater((state, slicer: ISlicer) => {
    if (isAdvancedFilter(slicer)) {
      slicer.children.forEach(slicer => {
        this.drill({
          parent: slicer.dimension,
          slicer: {
            ...slicer,
            drill: Drill.Children
          },
          dimension: slicer.dimension
        })
      })
    } else {
      this.drill({
        parent: slicer.dimension,
        slicer: {
          ...slicer,
          drill: Drill.Children
        },
        dimension: slicer.dimension
      })
    }
  })

}
