import { CdkDrag, CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild, computed, effect, inject, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatListModule } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmPrismHighlightComponent } from '@metad/components/prism'
import { PropertyCapacity, PropertyModule } from '@metad/components/property'
import { NxTableModule } from '@metad/components/table'
import { NxChartType } from '@metad/core'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { AnalyticalGridModule } from '@metad/ocap-angular/analytical-grid'
import { NgmMemberTreeComponent } from '@metad/ocap-angular/controls'
import { DisplayDensity, NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import { EntityCapacity, NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import {
  C_MEASURES,
  ChartAnnotation,
  ChartOrient,
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  ISlicer,
  assignDeepOmitBlank,
  cloneDeep,
  compact,
  getEntityDimensions,
  getEntityMeasures,
  nonNullable,
  pick
} from '@metad/ocap-core'
import { WidgetComponentType } from '@metad/story/core'
import { TranslateModule } from '@ngx-translate/core'
import { filter, map, switchMap } from 'rxjs/operators'
import { CHARTS, getChartType } from './types'
import { MatIconModule } from '@angular/material/icon'
import { ResizerModule } from '@metad/ocap-angular/common'
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'

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
    DragDropModule,
    NxTableModule,
    NgmPrismHighlightComponent,
    OcapCoreModule,
    NgmEntitySchemaComponent,
    NgmMemberTreeComponent,
    AnalyticalCardModule,
    AnalyticalGridModule,
    PropertyModule,
    ResizerModule
  ],
  selector: 'ngm-story-explorer',
  templateUrl: 'explorer.component.html',
  styleUrls: ['explorer.component.scss']
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
      const chartAnnotation = value?.dataSettings?.chartAnnotation
      if (chartAnnotation) {
        this.component.set({
          component: WidgetComponentType.AnalyticalCard,
          label: getChartType(chartAnnotation.chartType)?.label as NxChartType,
          dataSettings: value.dataSettings
        })
        this.rows.set(chartAnnotation.dimensions)
        this.columns.set(chartAnnotation.measures)
        this._dimensions.set(chartAnnotation.dimensions?.map((d) => d.dimension) ?? [])
      }
    }

  }
  private readonly _data = signal<{ dataSettings: DataSettings; chartAnnotation: ChartAnnotation }>(null)

  @Output() closed = new EventEmitter<void>()

  @ViewChild('addDimensionsTempl') addDimensionsTempl: TemplateRef<ElementRef>

  private dialogRef: MatDialogRef<ElementRef<any>, any>
  
  readonly _dimensionsCache = signal<string[]>([])
  private _dimensions = signal<string[]>([])
  dimensions = signal<{ dimension: Dimension; caption: string; hierarchies: Dimension[] }[]>([])

  readonly entityType = toSignal(
    toObservable(this._data).pipe(
      filter(nonNullable),
      switchMap(({ dataSettings }) =>
        this.dsCoreService
          .selectEntitySet(dataSettings.dataSource, dataSettings.entitySet)
          .pipe(map(({ entityType }) => entityType))
      )
    )
  )
  readonly dimensionList = computed(() => {
    return getEntityDimensions(this.entityType())
  })
  readonly measureList = computed(() => {
    return getEntityMeasures(this.entityType()).map((property) => ({
      dimension: C_MEASURES,
      measure: property.name,
      caption: property.caption
    }))
  })
  readonly dataSettings = computed<DataSettings>(() => {
    return pick(this.data?.dataSettings, 'dataSource', 'entitySet') as DataSettings
  })
  readonly dataSettingsChart = computed(() => {
    const chartAnnotation = assignDeepOmitBlank(
      {
        ...cloneDeep(this.component()?.dataSettings?.chartAnnotation ?? this.data?.chartAnnotation ?? {})
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
          ...this.measures().map((measure) => ({
            dimension: C_MEASURES,
            measure,
            formatting: {
              shortNumber: true
            }
          }))
        ]
      },
      5
    )

    chartAnnotation.dimensions = chartAnnotation.dimensions.filter((d) => d.dimension)
    chartAnnotation.measures = chartAnnotation.measures.filter((d) => d.dimension)

    return {
      ...(this.data?.dataSettings ?? {}),
      chartAnnotation
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
        ...this.measures().map((measure) => ({
          dimension: C_MEASURES,
          measure,
          formatting: {
            shortNumber: true
          }
        }))
      ]
    }
    console.log('analytics:', analytics)
    return {
      ...(this.data?.dataSettings ?? {}),
      analytics
    }
  })

  readonly _slicers = computed(() => {
    return Object.values(this.slicers()).map((slicer) => slicer)
  })

  readonly rows = signal<Dimension[]>([])
  readonly columns = signal<Dimension[]>([])
  readonly measures = signal<string[]>([])
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

  view: 'table' | 'chart' = 'table'
  visualPanel: 'visual' | 'options' = 'visual'
  charts = CHARTS.map((item) => cloneDeep(item) as any)

  constructor() {
    effect(
      () => {
        if (this.entityType()) {
          this.dimensions.set(
            getEntityDimensions(this.entityType()).filter(({name}) => this._dimensions().includes(name)) .map(({ name, caption, hierarchies }) => ({
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

  toggleHierarchy(hierarchy: string, { dimension }) {
    const index = this.dimensions().findIndex((d) => d.dimension.dimension === dimension.dimension)
    this.dimensions.set([
      ...this.dimensions().slice(0, index),
      {
        ...this.dimensions()[index],
        dimension: {
          ...this.dimensions()[index].dimension,
          hierarchy: hierarchy
        }
      },
      ...this.dimensions().slice(index + 1)
    ])
  }

  dropRowPredicate(item: CdkDrag<Dimension>) {
    return item.dropContainer.id === 'ngm-story-explorer__drop-list-dimensions-container'
  }

  dropRow(event: CdkDragDrop<Dimension[]>) {
    const items = [...this.rows()]
    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex)
    } else {
      items.splice(event.currentIndex, 0, { ...event.item.data.dimension })
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

  dropColumn(event: CdkDragDrop<Dimension[]>) {
    const items = [...this.columns()]
    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex)
    } else {
      items.splice(event.currentIndex, 0, { ...event.item.data })
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
    this.columns.set([...this.columns().slice(0, i), row, ...this.columns().slice(i + 1)])
  }

  onMeasuresChange(measures: string[]) {
    this.measures.set(measures)
  }

  onSlicersChange(slicer: ISlicer, dimension: string) {
    this.slicers.set({
      ...this.slicers(),
      [dimension]: slicer
    })
  }

  createWidget(widget: any) {
    console.log(widget)
    this.component.set(widget)
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
}
