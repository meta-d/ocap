import { Injectable, inject } from '@angular/core'
import { PropertyCapacity } from '@metad/components/property'
import { WidgetStylingSchema } from '@metad/story'
import { NxStoryService } from '@metad/story/core'
import {
  Appearance,
  IntentNavigation,
  DataSettingsSchemaService,
  FORMLY_W_1_2,
  FORMLY_W_1_3,
  FORMLY_W_FULL,
  FontCss,
  StylingWidgetSchema
} from '@metad/story/designer'
import { map } from 'rxjs/operators'

@Injectable()
export class KpiSchemaService extends DataSettingsSchemaService {

  protected readonly storyService = inject(NxStoryService)
  
  getSchema() {
    return this.translate.stream('Story.Widgets').pipe(
      map((STORY_DESIGNER) => {
        this.STORY_DESIGNER = STORY_DESIGNER
        return this.getBuilderSchema(STORY_DESIGNER)
      })
    )
  }

  getBuilderSchema(STORY_DESIGNER?: any) {
    const dataSettings = this.generateDataSettingsSchema(STORY_DESIGNER?.Common, this.getKPIAnnotation(STORY_DESIGNER))

    dataSettings.wrappers = ['expansion']

    return [dataSettings, this.kpiOptions]
  }

  getKPIAnnotation(BUILDER) {
    return {
      key: 'KPIAnnotation',
      wrappers: ['panel'],
      props: {
        label: BUILDER?.KPI?.MainKPI ?? 'Main KPI'
      },
      fieldGroup: [
        {
          key: 'DataPoint',
          fieldGroup: [
            {
              key: 'Title',
              type: 'input',
              props: {
                label: BUILDER?.Common?.Title ?? 'Title',
                appearance: 'fill'
              }
            },
            {
              key: 'Value',
              type: 'property-select',
              props: {
                label: BUILDER?.KPI?.Value ?? 'Value',
                required: true,
                dataSettings: this.dataSettings$,
                entityType: this.entityType$,
                capacities: [
                  PropertyCapacity.Measure,
                  PropertyCapacity.MeasureAttributes
                ]
              }
            },
            {
              key: 'TargetValue',
              type: 'property-select',
              props: {
                label: BUILDER?.KPI?.TargetValue ?? 'Target Value',
                required: true,
                dataSettings: this.dataSettings$,
                entityType: this.entityType$,
                capacities: [
                  PropertyCapacity.Measure,
                  PropertyCapacity.MeasureAttributes
                ]
              }
            }
          ]
        },
        {
          key: 'AdditionalDataPoints',
          type: 'table',
          props: {
            title: BUILDER?.KPI?.AdditionalDataPoints ?? 'Additional Data Points'
          },
          fieldArray: {
            fieldGroup: [
              {
                key: 'Title',
                type: 'input',
                props: {
                  title: BUILDER?.Common?.Title ?? 'Title',
                  appearance: 'fill'
                }
              },
              {
                key: 'Value',
                type: 'property-select',
                props: {
                  label: BUILDER?.KPI?.Value ?? 'Value',
                  required: true,
                  dataSettings: this.dataSettings$,
                  entityType: this.entityType$,
                  capacities: [
                    PropertyCapacity.Measure,
                    PropertyCapacity.MeasureAttributes
                  ]
                }
              },
              {
                key: 'TargetValue',
                type: 'property-select',
                props: {
                  label: BUILDER?.KPI?.TargetValue ?? 'Target Value',
                  required: true,
                  dataSettings: this.dataSettings$,
                  entityType: this.entityType$,
                  capacities: [
                    PropertyCapacity.Measure,
                    PropertyCapacity.MeasureAttributes
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }

  get kpiOptions() {
    const BUILDER = this.STORY_DESIGNER
    const className = FORMLY_W_1_2
    return {
      key: 'options',
      wrappers: ['expansion'],
      props: {
        label: BUILDER?.KPI?.Options ?? 'Options',
        expanded: true
      },
      fieldGroup: [
        {
          fieldGroupClassName: 'nx-formly__row',
          fieldGroup: [
            {
              className,
              key: 'shortNumber',
              type: 'checkbox',
              props: {
                label: BUILDER?.KPI?.ShortNumber ?? 'Short Number'
              }
            },
            {
              className,
              key: 'digitsInfo',
              type: 'input',
              props: {
                label: BUILDER?.KPI?.DigitsInfo ?? 'Digits Info',
                placeholder: `Eg. 0.0-2`
              }
            },
            {
              className,
              key: 'unit',
              type: 'input',
              props: {
                label: BUILDER?.KPI?.Unit ?? 'Unit'
              }
            },
            {
              className,
              key: 'unitSemantics',
              type: 'select',
              props: {
                label: BUILDER?.KPI?.UnitSemantics ?? 'Unit Semantics',
                options: [
                  {
                    value: 'currency-code',
                    label: BUILDER?.KPI?.CurrencyCode ?? 'Currency Code'
                  },
                  {
                    value: 'unit-of-measure',
                    label: BUILDER?.KPI?.UnitOfMeasure ?? 'Unit of Measure'
                  }
                ]
              }
            },
            {
              className,
              key: 'showDeviation',
              type: 'checkbox',
              props: {
                label: BUILDER?.KPI?.ShowDeviation ?? 'Show Deviation'
              }
            },
            {
              className,
              key: 'deviationText',
              type: 'input',
              props: {
                label: BUILDER?.KPI?.DeviationText ?? 'Deviation Text'
              }
            },

          ]
        },
        IntentNavigation(className, BUILDER, this.storyService)
      ]
    }
  }
}

/**
 * 组件样式属性, 包括组件内部样式
 */
@Injectable()
export class KpiStylingSchemaService extends WidgetStylingSchema {
  getSchema() {
    return this.translate.stream('STORY_DESIGNER').pipe(
      map((DESIGNER) => {
        return [
          Appearance(FORMLY_W_FULL, DESIGNER?.COMMON),
          StylingWidgetSchema(FORMLY_W_1_2, DESIGNER),
          {
            wrappers: ['expansion'],
            props: {
              label: DESIGNER?.BUILDER?.KPI?.TitleStyle ?? 'Title Style'
            },
            fieldGroup: [
              {
                fieldGroupClassName: 'nx-formly__row',
                key: 'title',
                fieldGroup: FontCss(FORMLY_W_1_3, DESIGNER?.STYLING?.CSS?.FONT)
              }
            ]
          }
        ] as any[]
      })
    )
  }
}
