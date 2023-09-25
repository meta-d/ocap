import { CdkDrag, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, computed, effect, inject, signal } from '@angular/core'
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
  ISlicer,
  assignDeepOmitBlank,
  cloneDeep,
  getEntityDimensions,
  getEntityMeasures,
  nonNullable,
  pick
} from '@metad/ocap-core'
import { WidgetComponentType } from '@metad/story/core'
import { TranslateModule } from '@ngx-translate/core'
import { filter, map, switchMap } from 'rxjs/operators'
import { CHARTS, getChartType } from './types'

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
    DragDropModule,
    NxTableModule,
    NgmPrismHighlightComponent,
    OcapCoreModule,
    NgmEntitySchemaComponent,
    NgmMemberTreeComponent,
    AnalyticalCardModule,
    AnalyticalGridModule,
    PropertyModule
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

  private readonly dsCoreService = inject(NgmDSCoreService)

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
      }
    }

  }
  private readonly _data = signal<{ dataSettings: DataSettings; chartAnnotation: ChartAnnotation }>(null)

  @Output() closed = new EventEmitter<void>()

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

  readonly measureList = computed(() => {
    return getEntityMeasures(this.entityType())
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

    console.log('chartAnnotation:', chartAnnotation)
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
      columns: this.measures().map((measure) => ({
        dimension: C_MEASURES,
        measure
      }))
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
            getEntityDimensions(this.entityType()).map(({ name, caption, hierarchies }) => ({
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
    return true
  }

  dropRow(event: CdkDragDrop<Dimension[]>) {
    this.rows.set([...this.rows(), { ...event.item.data }])
  }

  dropColumn(event: CdkDragDrop<Dimension[]>) {
    this.columns.set([...this.columns(), { ...event.item.data }])
  }

  onRowChange(row: Dimension, i: number) {
    this.rows.set([...this.rows().slice(0, i), row, ...this.rows().slice(i + 1)])
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
}
