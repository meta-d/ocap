import { Injectable } from '@angular/core'
import {
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartOptions,
  ChartSettings,
  ChartType,
  getEntityProperty,
  isIndicatorMeasureProperty,
  isMeasure,
  SelectionPresentationVariant
} from '@metad/ocap-core'
import { PropertyCapacity } from '@metad/components/property'
import { PropertyCapacity as FormlyPropertyCapacity } from '@metad/components/property'
import {
  AccordionWrappers,
  BaseDesignerSchemaService,
  BaseSchemaState,
  DataSettingsSchemaService,
  FORMLY_ROW,
  FORMLY_W_1_2,
  PresentationVariantExpansion,
  SchemaState,
  SelectionVariantExpansion
} from '@metad/story/designer'
import { isEmpty, isEqual } from 'lodash-es'
import { distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators'
import {
  AllCapacity,
  AxisCapacity,
  CapacityMatrix,
  CategoryAxis,
  DataZoomAttributes,
  DataZoomCapacity,
  GlobalCapacity,
  SeriesCapacityMatrix,
  TooltipCapacity,
  VisualMapCapacity
} from './schemas'
import { ColorPalettes } from '@metad/core'


export interface AnalyticalCardSchemaState extends SchemaState {
  model: {
    dataSettings: {
      dataSource: string
      entitySet: string
      chartAnnotation: ChartAnnotation
    }
    selectionPresentationVariants: SelectionPresentationVariant[]
    chartSettings: ChartSettings
    chartOptions: ChartOptions
  }
}

@Injectable()
export class AnalyticalCardSchemaService extends DataSettingsSchemaService<AnalyticalCardSchemaState> {
  readonly chartAnnotation$ = this.select((state) => state.model?.dataSettings?.chartAnnotation)
  readonly _chartType$ = this.chartAnnotation$.pipe(
    map((chartAnnotation) => chartAnnotation?.chartType),
    distinctUntilChanged(isEqual)
  )
  readonly chartType$ = this._chartType$.pipe(
    map((chartType) => chartType?.type),
    distinctUntilChanged()
  )

  readonly restrictedDimensions$ = this.chartAnnotation$.pipe(
    withLatestFrom(this.entitySet$),
    map(([chartAnnotation, entitySet]) => {
      const freeDimensions: string[] = []
      chartAnnotation?.measures?.forEach((measure) => {
        if (isMeasure(measure) && measure?.measure) {
          const property = getEntityProperty(entitySet.entityType, measure.measure)
          if (isIndicatorMeasureProperty(property)) {
            const indicator = entitySet.indicators?.find(
              (indicator) => indicator.code === property.name || indicator.name === property.name
            )
            if (!isEmpty(indicator?.dimensions)) {
              freeDimensions.push(...indicator.dimensions)
            }
          }
        }
      })

      return freeDimensions
    })
  )

  getSchema() {
    return this.chartType$.pipe(
      withLatestFrom(this.translate.stream('Story')),
      map(([type, i18nStory]) => {
        this.STORY_DESIGNER = i18nStory
        const chartType = this.get((state) => state.model?.dataSettings?.chartAnnotation?.chartType)
        return this.getBuilderSchema(chartType, i18nStory)
      })
    )
  }

  getBuilderSchema(chartType: ChartType, i18nStory?) {
    
    const BUILDER = i18nStory?.Widgets?.Common

    const dataSettings = this.generateDataSettingsSchema(BUILDER)
    dataSettings.wrappers = ['expansion']

    dataSettings.fieldGroup.splice(
      2,
      0,
      {
        key: 'chartAnnotation',
        props: {
          label: 'Chart Annotation',
          required: true,
          type: 'expansion',
          icon: 'analytics'
        },
        fieldGroup: this.getChartAnnotationFieldGroup(chartType, i18nStory?.Widgets?.CHART)
      } as unknown,
      ...SelectionVariantExpansion(BUILDER, this.dataSettings$),
      ...PresentationVariantExpansion(BUILDER, this.dataSettings$, this.entityType$, this.properties$)
    )

    return [
      {
        wrappers: ['panel'],
        props: {
          padding: true
        },
        fieldGroup: [
          {
            key: 'title',
            type: 'input',
            props: {
              label: BUILDER?.Title ?? 'Title',
              required: true
            }
          }
        ]
      },
      dataSettings,
      {
        key: 'options',
        wrappers: ['expansion'],
        props: {
          label: i18nStory?.Widgets?.CHART?.Options ?? 'Options'
        },
        fieldGroup: [
          {
            fieldGroupClassName: FORMLY_ROW,
            fieldGroup: [
              {
                className: FORMLY_W_1_2,
                key: 'hideHeader',
                type: 'checkbox',
                props: {
                  label: i18nStory?.Widgets?.CHART?.HideHeader ?? 'Hide Header'
                }
              },
              {
                className: FORMLY_W_1_2,
                key: 'hideDataDownload',
                type: 'checkbox',
                props: {
                  label: i18nStory?.Widgets?.CHART?.HideDataDownload ?? 'Hide Data Download'
                }
              },
              {
                className: FORMLY_W_1_2,
                key: 'hideScreenshot',
                type: 'checkbox',
                props: {
                  label: i18nStory?.Widgets?.CHART?.HideScreenshot ?? 'Hide Screenshot'
                }
              },
              {
                className: FORMLY_W_1_2,
                key: 'realtimeLinked',
                type: 'checkbox',
                props: {
                  label: i18nStory?.Widgets?.CHART?.RealTimeLinkedAnalysis ?? 'Real Time Linked Analysis'
                }
              },
              {
                className: FORMLY_W_1_2,
                key: 'disableContextMenu',
                type: 'checkbox',
                props: {
                  label: i18nStory?.Widgets?.CHART?.DisableContextMenu ?? 'Disable Context Menu'
                }
              },
              
            ]
          }
        ]
      },
      ...AccordionWrappers([
        {
          key: 'chartSettings',
          label: i18nStory?.Widgets?.CHART?.ChartSettings ?? 'Chart Settings',
          toggleable: false,
          fieldGroup: chartSettingsFieldGroup(i18nStory?.Widgets)
        }
      ]),

      getChartOptionsSchema(chartType, i18nStory?.STYLING?.ECHARTS)
    ]
  }

  getChartAnnotationFieldGroup(chartType, CHART?) {
    const results = [
      {
        key: 'chartType',
        type: 'chart-type'
      }
    ] as any

    results.push(
      {
        key: 'measures',
        type: 'array',
        props: {
          label: CHART?.MEASURES ?? 'Measures',
          hideDelete: true,
          sortable: true
        },
        fieldArray: {
          type: 'property-select',
          props: {
            required: true,
            removable: true,
            sortable: true,
            dataSettings: this.dataSettings$,
            entitySet: this.entitySet$,
            entityType: this.entityType$,
            chartType$: this._chartType$,
            capacities: [
              PropertyCapacity.Measure,
              PropertyCapacity.MeasureAttributes,
              PropertyCapacity.Order,
              FormlyPropertyCapacity.MeasureStyle,
              FormlyPropertyCapacity.MeasureStyleRole,
              FormlyPropertyCapacity.MeasureStyleShape,
              FormlyPropertyCapacity.MeasureStylePalette,
              FormlyPropertyCapacity.MeasureStylePalettePattern,
              FormlyPropertyCapacity.MeasureStyleReferenceLine,
              FormlyPropertyCapacity.MeasureStyleChartOptions
            ],
            colors: [
              ...ColorPalettes
            ]
          }
        }
      },
      {
        key: 'dimensions',
        type: 'array',
        props: {
          label: CHART?.DIMENSIONS ?? 'Dimensions',
          hideDelete: true
        },
        fieldArray: {
          type: 'property-select',
          props: {
            required: true,
            removable: true,
            sortable: true,
            dataSettings: this.dataSettings$,
            entityType: this.entityType$,
            restrictedDimensions: this.restrictedDimensions$,
            capacities: [
              PropertyCapacity.Dimension,
              PropertyCapacity.Order,
              FormlyPropertyCapacity.DimensionChart
            ]
          }
        }
      }
    )

    return results
  }

}

@Injectable()
export class MeasureChartOptionsSchemaService extends BaseDesignerSchemaService<BaseSchemaState> {
  public readonly storyDesigner$ = this.translate.stream('STORY_DESIGNER')

  public readonly chartType$ = this.model$.pipe(map((model) => model.chartType))

  getSchema() {
    return this.storyDesigner$.pipe(
      map((STORY_DESIGNER) => STORY_DESIGNER?.STYLING?.ECHARTS),
      map((ECHARTS) => {
        const chartType = this.get((state) => state.model.chartType)
        return [{ key: 'chartType', type: 'empty' }, this.getChartOptions(chartType, ECHARTS)]
      })
    )
  }

  getChartOptions(chartType: ChartType, ECHARTS) {
    const className = FORMLY_W_1_2
    const chartOptions: any = {
      key: 'chartOptions',
      props: {},
      fieldGroup: []
    }

    if (!chartType) {
      return chartOptions
    }

    let capacityMatrix
    const capacityName = chartType.type + (chartType.variant ?? '')
    if (SeriesCapacityMatrix[capacityName]) {
      capacityMatrix = SeriesCapacityMatrix[capacityName]
    } else if (CapacityMatrix[chartType.type]) {
      capacityMatrix = SeriesCapacityMatrix[chartType.type]
    }

    capacityMatrix?.forEach((capacity) => {
      const fieldGroup = capacity(className, ECHARTS)
      if (Array.isArray(fieldGroup)) {
        chartOptions.fieldGroup.push(...fieldGroup)
      } else {
        chartOptions.fieldGroup.push(fieldGroup)
      }
    })

    chartOptions.fieldGroup.push(...AxisCapacity(className, ECHARTS))
    chartOptions.fieldGroup.push(...TooltipCapacity(className, ECHARTS))
    chartOptions.fieldGroup.push(...VisualMapCapacity(className, ECHARTS))
    chartOptions.fieldGroup.push(...DataZoomCapacity(className, ECHARTS))

    return chartOptions
  }
}

@Injectable()
export class DimensionChartOptionsSchemaService extends BaseDesignerSchemaService<BaseSchemaState> {
  public readonly storyDesigner$ = this.translate.stream('STORY_DESIGNER')

  public readonly role$ = this.model$.pipe(map((model) => model.role))

  getSchema() {
    return this.storyDesigner$.pipe(
      map((STORY_DESIGNER) => STORY_DESIGNER?.STYLING?.ECHARTS),
      map((ECHARTS) => {
        const role = this.get((state) => state.model.role)
        return [{ key: 'role', type: 'empty' }, this.getChartOptions(role, ECHARTS)]
      })
    )
  }

  getChartOptions(role: ChartDimensionRoleType, I18N) {
    const className = FORMLY_W_1_2
    const chartOptions: any = {
      key: 'chartOptions',
      props: {},
      fieldGroup: []
    }
    chartOptions.fieldGroup = [
      ...AccordionWrappers([
        {
          key: 'axis',
          label: I18N?.CATEGORY_AXIS?.TITLE ?? 'Axis',
          fieldGroup: CategoryAxis(className, I18N)
        },
        {
          key: 'dataZoom',
          label: I18N?.DATAZOOM_STYLE?.DATAZOOM ?? 'Data Zoom',
          fieldGroup: [
            {
              fieldGroupClassName: FORMLY_ROW,
              fieldGroup: DataZoomAttributes(className, I18N)
            }
          ]
        }
      ]),
    ]

    return chartOptions
  }
}

@Injectable()
export class ChartOptionsSchemaService extends BaseDesignerSchemaService<BaseSchemaState> {

  public readonly storyDesigner$ = this.translate.stream('STORY_DESIGNER')

  getSchema() {
    return this.storyDesigner$.pipe(
      map((STORY_DESIGNER) => STORY_DESIGNER?.STYLING?.ECHARTS),
      map((ECHARTS) => {
        const chartType = this.get((state) => state.model)

        return [
          getChartOptionsSchema(chartType, ECHARTS)
        ] as any
      })
    )
  }
}

export function getChartOptionsSchema(chartType: ChartType, I18N) {
    const className = FORMLY_W_1_2
    const chartOptions: any = {
      key: 'chartOptions',
      fieldGroup: [...GlobalCapacity(className, I18N)]
    }

    if (!chartType) {
      return chartOptions
    }

    let capacityMatrix
    const capacityName = chartType.type + (chartType.variant ?? '')
    if (CapacityMatrix[capacityName]) {
      capacityMatrix = CapacityMatrix[capacityName]
    } else if (CapacityMatrix[chartType.type]) {
      capacityMatrix = CapacityMatrix[chartType.type]
    }

    capacityMatrix?.forEach((capacity) => {
      const fieldGroup = capacity(FORMLY_W_1_2, I18N)
      if (Array.isArray(fieldGroup)) {
        chartOptions.fieldGroup.push(...fieldGroup)
      } else {
        chartOptions.fieldGroup.push(fieldGroup)
      }
    })

    AllCapacity.forEach((capacity) => {
      const fieldGroup = capacity(FORMLY_W_1_2, I18N)
      if (Array.isArray(fieldGroup)) {
        chartOptions.fieldGroup.push(...fieldGroup)
      } else {
        chartOptions.fieldGroup.push(fieldGroup)
      }
    })

    return chartOptions
}

export function chartSettingsFieldGroup(i18n) {
  return [
    {
      fieldGroupClassName: FORMLY_ROW,
      fieldGroup: [
        {
          className: FORMLY_W_1_2,
          key: 'maximumLimit',
          type: 'input',
          props: {
            label: i18n?.CHART?.MaximumLimit ?? 'Maximum Limit',
            type: 'number'
          }
        },
        {
          className: FORMLY_W_1_2,
          key: 'digitInfo',
          type: 'input',
          props: {
            label: i18n?.CHART?.DigitInfo ?? 'Digit Info'
          }
        },
        {
          className: FORMLY_W_1_2,
          key: 'trellisHorizontal',
          type: 'slider',
          props: {
            label: i18n?.CHART?.TrellisHorizontal ?? 'Trellis Horizontal',
            type: 'number',
            thumbLabel: true,
            autoScale: true,
            min: 1,
            max: 10
          }
        },
        {
          className: FORMLY_W_1_2,
          key: 'universalTransition',
          type: 'checkbox',
          props: {
            label: i18n?.CHART?.UniversalTransition ?? 'Universal Transition'
          }
        }
      ]
    },
    {
      key: 'chartTypes',
      type: 'array',
      props: {
        label: i18n?.CHART?.ChartVariants ?? 'Chart Variants',
        hideDelete: true,
        sortable: true
      },
      fieldArray: {
        type: 'chart-type',
        props: {
          removable: true
        }
      }
    },

    // {
    //   key: 'customLogic',
    //   type: 'code-editor',
    //   props: {
    //     label: i18nStory?.Widgets?.CHART?.CustomLogic ?? 'Custom Logic',
    //     language: 'javascript'
    //   },
    //   expressions: {
    //     hide: (field: FormlyFieldConfig) => {
    //       return (
    //         field.parent.parent.model?.dataSettings?.chartAnnotation?.chartType?.type !== NxChartType.Custom
    //       )
    //     }
    //   }
    // }
  ]
}