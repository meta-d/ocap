import { CdkDrag, CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild, computed, effect, inject, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatListModule } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatTabsModule } from '@angular/material/tabs'
import { NgmPrismHighlightComponent } from '@metad/components/prism'
import { PropertyCapacity, PropertyModule } from '@metad/components/property'
import { NxTableModule } from '@metad/components/table'
import { NxChartType } from '@metad/core'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { NgmMemberTreeComponent } from '@metad/ocap-angular/controls'
import { DisplayDensity, NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import { EntityCapacity, NgmEntityPropertyComponent, NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { NgmChartPropertyComponent, NgmChartSettingsComponent } from '@metad/story/widgets/analytical-card'
import {
  C_MEASURES,
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartOrient,
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  ISlicer,
  Measure,
  assignDeepOmitBlank,
  cloneDeep,
  getEntityDimensions,
  getEntityMeasures,
  isString,
  nonNullable,
  omit,
  pick
} from '@metad/ocap-core'
import { WidgetComponentType } from '@metad/story/core'
import { TranslateModule } from '@ngx-translate/core'
import { combineLatestWith, filter, map, startWith, switchMap } from 'rxjs/operators'
import { MatIconModule } from '@angular/material/icon'
import { NgmSearchComponent, ResizerModule } from '@metad/ocap-angular/common'
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { CHARTS, getChartType } from './types'
import { MatRadioModule } from '@angular/material/radio'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatChipsModule,
    MatButtonModule,
    MatListModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    MatRadioModule,
    DragDropModule,
    NxTableModule,
    NgmPrismHighlightComponent,
    OcapCoreModule,
    NgmEntitySchemaComponent,
    NgmMemberTreeComponent,
    AnalyticalCardModule,
    AnalyticalGridModule,
    PropertyModule,
    ResizerModule,
    NgmEntityPropertyComponent,
    NgmSearchComponent,
    NgmChartSettingsComponent,
    NgmChartPropertyComponent
  ],
  selector: 'ngm-story-explorer',
  templateUrl: 'explorer.component.html',
  styleUrls: ['explorer.component.scss'],
  host: {
    class: 'ngm-story-explorer'
  }
})
export class StoryExplorerComponent {
  EntityCapacity = EntityCapacity
  DisplayDensity = DisplayDensity
  PropertyCapacity = PropertyCapacity
  ComponentType = WidgetComponentType
  FilterSelectionType = FilterSelectionType

  private readonly dsCoreService = inject(NgmDSCoreService)
  private readonly _dialog = inject(MatDialog)

  @Input()
  get data() {
    return this._data()
  }
  set data(value: any) {
    this._data.set(value)
    if (value) {
      console.log(value)

      const chartAnnotation = value?.dataSettings?.chartAnnotation
      const analytics = value?.dataSettings?.analytics
      if (chartAnnotation) {
        this.component.set({
          component: WidgetComponentType.AnalyticalCard,
          label: getChartType(chartAnnotation.chartType)?.label as NxChartType,
          dataSettings: value.dataSettings
        })
        this.rows.set(chartAnnotation.dimensions)
        this.columns.set(chartAnnotation.measures)
        this._dimensions.set(chartAnnotation.dimensions?.map((d) => d.dimension) ?? [])
        this._chartSettings.set({
          chartOptions: value.chartOptions,
          chartSettings: value.chartSettings,
        })
        this.visualPanel = 'visual'
        this.view = 'chart'
      } else if(analytics) {
        this.component.set({
          label: null,
          component: WidgetComponentType.AnalyticalGrid,
          dataSettings: value.dataSettings
        })

        this.rows.set(analytics.rows)
        this.columns.set(analytics.columns)
        this._dimensions.set(
          [...analytics.rows, ...analytics.columns].filter((d) => d.dimension !== C_MEASURES).map((d) => d.dimension)
        )
        this.visualPanel = 'options'
        this.view = 'table'
      }
    }

  }
  private readonly _data = signal<{ dataSettings: DataSettings; chartAnnotation: ChartAnnotation }>(null)

  @Output() closed = new EventEmitter<any>()

  @ViewChild('addDimensionsTempl') addDimensionsTempl: TemplateRef<ElementRef>

  private dialogRef: MatDialogRef<ElementRef<any>, any>
  
  DIMENSION_ROLES = [
    { label: 'None', value: null },
    { label: 'Category', value: ChartDimensionRoleType.Category },
    { label: 'Category2', value: ChartDimensionRoleType.Category2 },
    { label: 'Group', value: ChartDimensionRoleType.Group },
    { label: 'Stacked', value: ChartDimensionRoleType.Stacked },
    // { label: 'Color', value: ChartDimensionRoleType.Color }, 应该是还未支持
    { label: 'Trellis', value: ChartDimensionRoleType.Trellis }
  ]
  
  measureSearch = new FormControl('')

  readonly _dimensionsCache = signal<string[]>([])
  private _dimensions = signal<string[]>([])
  dimensions = signal<{ dimension: Dimension; caption: string; hierarchies: Dimension[] }[]>([])

  readonly entityType = toSignal(
    toObservable(this._data).pipe(
      filter(nonNullable),
      map(({ dataSettings }) => dataSettings),
      filter((dataSettings) => !!(dataSettings?.dataSource && dataSettings?.entitySet)),
      switchMap((dataSettings) =>
        this.dsCoreService
          .selectEntitySet(dataSettings.dataSource, dataSettings.entitySet)
          .pipe(map(({ entityType }) => entityType))
      )
    )
  )
  readonly dimensionList = computed(() => {
    return getEntityDimensions(this.entityType())
  })
  readonly measureList = toSignal(toObservable(this.entityType).pipe(
    map(getEntityMeasures),
    combineLatestWith(this.measureSearch.valueChanges.pipe(startWith(''))),
    map(([measures, search]) => {
      return search ? measures.filter((measure) => measure.name.toLowerCase().includes(search.toLowerCase()) ||
        measure.caption.toLowerCase().includes(search.toLowerCase())) : measures
    }))
  )

  readonly dataSettings = computed<DataSettings>(() => {
    return pick(this.data?.dataSettings, 'dataSource', 'entitySet') as DataSettings
  })
  readonly dataSettingsChart = computed(() => {
    const chartAnnotation = assignDeepOmitBlank(
      {
        ...cloneDeep(omit(this.component()?.dataSettings?.chartAnnotation ?? this.data?.chartAnnotation ?? {}, 'dimensions', 'measures') )
      },
      {
        dimensions: this.rows().map((row) => ({
          ...row,
          chartOptions: {
            dataZoom: {
              type: 'inside'
            }
          }
        })),
        measures: [
          ...this.columns(),
        ]
      },
      5
    )

    chartAnnotation.dimensions = chartAnnotation.dimensions.filter((d) => d.dimension)
    chartAnnotation.measures = chartAnnotation.measures.filter((d) => d.dimension)

    return {
      ...(this.data?.dataSettings ?? {}),
      chartAnnotation,
      selectionVariant: {
        selectOptions: Object.values(this.slicers()).map((slicer) => slicer).filter((slicer) => slicer?.members?.length)
      }
    }
  })
  readonly chartOptions = signal({
    legend: {
      show: true
    }
  })
  readonly dataSettingsGrid = computed(() => {
    const analytics = {
      ...(this.data?.analytics ?? {}),
      rows: this.rows(),
      columns: [
        ...this.columns(),
      ]
    }

    console.log(`Explorer analytics:`, analytics)

    return {
      ...(this.data?.dataSettings ?? {}),
      analytics,
      selectionVariant: {
        selectOptions: Object.values(this.slicers()).map((slicer) => slicer).filter(nonNullable).filter((slicer) => slicer?.members?.length)
      }
    } as DataSettings
  })

  readonly rows = signal<Dimension[]>([])
  readonly columns = signal<(Dimension | Measure)[]>([])
  readonly slicers = signal<{ [name: string]: ISlicer }>({})
  readonly component = signal({
    label: NxChartType.Bar,
    component: WidgetComponentType.AnalyticalCard,
    dataSettings: {
      chartAnnotation: {
        chartType: {
          type: NxChartType.Bar,
          orient: ChartOrient.horizontal
        },
        dimensions: [{}],
        measures: [{}]
      }
    }
  })
  readonly chartType = computed(() => {
    return this.component()?.dataSettings?.chartAnnotation?.chartType
  })

  view: 'table' | 'chart' = 'table'
  visualPanel: 'visual' | 'options' = 'visual'
  charts = CHARTS.map((item) => cloneDeep(item) as any)

  get chartSettings() {
    return this._chartSettings()
  }
  set chartSettings(value) {
    this._chartSettings.set(value)
    console.log(`ChartSettings: `, this._chartSettings())
  }
  private _chartSettings = signal<{chartSettings?: any; chartOptions?: any}>({})

  constructor() {
    effect(
      () => {
        if (this.entityType()) {
          this.dimensions.set(
            getEntityDimensions(this.entityType()).filter(({name}) => this._dimensions().includes(name)).map(({ name, caption, hierarchies }) => ({
              dimension: {
                dimension: name,
                displayBehaviour: DisplayBehaviour.descriptionOnly
              },
              caption,
              hierarchies: hierarchies.map((hierarchy) => ({
                dimension: name,
                hierarchy: hierarchy.name,
                caption: hierarchy.caption
              }))
            }))
          )
        }
      },
      { allowSignalWrites: true }
    )
  }

  back() {
    this.closed.emit()
  }

  trackByDim(index, item) {
    return item?.dimension?.dimension
  }

  trackByIndex(index, item) {
    return index
  }

  setHierarchy(dimension: string, hierarchy: string | null) {
    const dimensions = [...this.dimensions()]
    const index = dimensions.findIndex((d) => d.dimension.dimension === dimension)
    dimensions[index] = {
      ...dimensions[index],
      dimension: {
        ...dimensions[index].dimension,
        hierarchy
      }
    }
    // Update dimensions
    this.dimensions.set(dimensions)
  }

  toggleHierarchy(dimension: string, hierarchy: string | null) {
    // Clear slicers for the dimension
    this.slicers.set({
      ...this.slicers(),
      [dimension]: {}
    })

    this.setHierarchy(dimension, hierarchy)
  }

  dropRowPredicate(item: CdkDrag<Dimension>) {
    return item.dropContainer.id === 'ngm-story-explorer__drop-list-dimensions'
  }

  dropRow(event: CdkDragDrop<Dimension[]>) {
    const items = [...this.rows()]
    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex)
    } else {
      items.splice(event.currentIndex, 0, 
        isString(event.item.data.dimension) ? { ...event.item.data } : { ...event.item.data.dimension }
      )
    }
    this.rows.set(items)
  }

  removeRow(i: number) {
    const items = [...this.rows()]
    items.splice(i, 1)
    this.rows.set(items)
  }

  dropColumnPredicate(item: CdkDrag<Dimension>) {
    return item.dropContainer.id === 'ngm-story-explorer__drop-list-measures'
  }

  dropColumn(event: CdkDragDrop<(Dimension | Measure)[]>) {
    const items = [...this.columns()]
    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex)
    } else {
      items.splice(event.currentIndex, 0, { 
        dimension: C_MEASURES,
        measure: event.item.data.name,
        caption: event.item.data.caption
       })
    }
    this.columns.set(items)
  }

  removeColumn(i: number) {
    const items = [...this.columns()]
    items.splice(i, 1)
    this.columns.set(items)
  }

  onRowChange(row: Dimension, i: number) {
    this.rows.set([...this.rows().slice(0, i), row, ...this.rows().slice(i + 1)])
  }

  onColumnChange(row: Dimension, i: number) {
    console.log(this.columns(), row)
    this.columns.set([...this.columns().slice(0, i), row, ...this.columns().slice(i + 1)])
  }

  onSlicersChange(slicer: ISlicer, dimension: string) {
    // Toggle hierarchy for the dimension
    this.setHierarchy(dimension, slicer.members?.length ? (slicer.dimension.hierarchy || slicer.dimension.dimension) : null)

    // Set slicer for the dimension
    this.slicers.set({
      ...this.slicers(),
      [dimension]: slicer
    })
  }

  createWidget(widget: any) {
    this.component.set(widget)
    if (this.component().component === WidgetComponentType.AnalyticalCard) {
      this.view = 'chart'
    }
  }

  addDimensionToCache(event) {
    this._dimensionsCache.set([...event])
  }

  openDimensions() {
    this._dimensionsCache.set([...this._dimensions()])
    this.dialogRef = this._dialog.open(this.addDimensionsTempl)
  }

  addDimensions() {
    this._dimensions.set([...this._dimensionsCache()])
    this.dialogRef.close()
  }

  moveDimension(event: CdkDragDrop<any[]>) {
    const items = [...this.dimensions()]
    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex)
      this.dimensions.set(items)
    } 
  }

  close() {
    this.closed.emit({
      dataSettings: this.component().component === WidgetComponentType.AnalyticalCard ? this.dataSettingsChart() :
        this.dataSettingsGrid(),
      chartSettings: this.chartSettings?.chartSettings,
      chartOptions: this.chartSettings?.chartOptions
    })
  }
}
