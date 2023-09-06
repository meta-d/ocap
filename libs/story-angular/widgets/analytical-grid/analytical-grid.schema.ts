import { Injectable } from '@angular/core'
import { DataSettings, EntityType } from '@metad/ocap-core'
import { PropertyCapacity } from '@metad/components/property'
import { ColorPalettes } from '@metad/core'
import { PropertyCapacity as FormlyPropertyCapacity } from '@metad/components/property'
import {
  DataSettingsSchemaService,
  FORMLY_ROW,
  FORMLY_W_1_2,
  PresentationVariantExpansion,
  SelectionVariantExpansion,
} from '@metad/story/designer'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'


@Injectable()
export class AnalyticalGridSchemaService extends DataSettingsSchemaService {

  getSchema() {
    return this.translate.stream('Story').pipe(
      map((STORY_DESIGNER) => {
        this.STORY_DESIGNER = STORY_DESIGNER
        return this.getBuilderSchema()
      })
    )
  }

  getBuilderSchema() {
    const Widgets = this.STORY_DESIGNER.Widgets

    const dataSettings = this.generateDataSettingsSchema(
      Widgets?.Common,
      AnalyticsAnnotationSchema(Widgets, this.dataSettings$, this.entityType$),
      ...SelectionVariantExpansion(Widgets?.Common, this.dataSettings$),
      ...PresentationVariantExpansion(Widgets?.Common, this.dataSettings$, this.entityType$, this.properties$),
    )

    dataSettings.wrappers = ['expansion']

    const className = FORMLY_W_1_2
    return [
      {
        wrappers: ['panel'],
        templateOptions: {
          padding: true
        },
        fieldGroup: [
          {
            key: 'title',
            type: 'input',
            templateOptions: {
              label: Widgets?.Common?.Title ?? 'Title',
              required: true
            }
          }
        ]
      },
      dataSettings,

      {
        key: 'options',
        wrappers: ['expansion'],
        templateOptions: {
          label: Widgets?.AnalyticalGrid?.GridOptions ?? 'Grid Options',
          expanded: true
        },
        fieldGroup: [
          {
            fieldGroupClassName: FORMLY_ROW,
            fieldGroup: [
              {
                className,
                key: 'showToolbar',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.showToolbar ?? 'Show Toolbar'
                }
              },
              {
                
                className,
                key: 'hideDataDownload',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.HideDataDownload ?? 'Hide Data Download'
                }
              },
              {
                className,
                key: 'strip',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.Strip ?? 'Strip'
                }
              },
              {
                className,
                key: 'grid',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.Grid ?? 'Grid'
                }
              },
              {
                className,
                key: 'sticky',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.TableHeaderSticky ?? 'Table Header Sticky'
                }
              },
              {
                className,
                key: 'sortable',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.Sortable ?? 'Sortable'
                }
              },
              {
                className,
                key: 'selectable',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.ColumnSelectable ?? 'Column Selectable'
                }
              },
            ]
          },

          {
            fieldGroupClassName: FORMLY_ROW,
            fieldGroup: [
              {
                className,
                key: 'paging',
                type: 'checkbox',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.Paging ?? 'Paging'
                }
              },
              {
                className,
                key: 'pageSize',
                type: 'input',
                templateOptions: {
                  type: 'number',
                  label: Widgets?.AnalyticalGrid?.PageSize ?? 'Page Size'
                }
              },

              {
                className,
                key: 'initialRowLevel',
                type: 'input',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.InitialRowLevel ?? 'Initial Row Level',
                  type: 'number'
                }
              },
              {
                className,
                key: 'initialColumnLevel',
                type: 'input',
                templateOptions: {
                  label: Widgets?.AnalyticalGrid?.InitialColumnLevel ?? 'Initial Column Level',
                  type: 'number'
                }
              },

              {
                className,
                key: 'digitsInfo',
                type: 'input',
                props: {
                  label: Widgets?.AnalyticalGrid?.DigitsInfo ?? 'Digits Info',
                }
              },
              {
                className,
                key: 'unit',
                type: 'input',
                props: {
                  label: Widgets?.AnalyticalGrid?.Unit ?? 'Unit',
                }
              },
              {
                className,
                key: 'currencyCode',
                type: 'input',
                props: {
                  label: Widgets?.AnalyticalGrid?.CurrencyCode ?? 'Currency Code',
                }
              }
            ]
          }
        ]
      }
    ] as any
  }
}


export function GridOptionsSchema(className: string, Widgets) {

  return [
    {
      fieldGroupClassName: FORMLY_ROW,
      fieldGroup: [
        {
          className,
          key: 'showToolbar',
          type: 'toggle',
          templateOptions: {
            label: Widgets?.AnalyticalGrid?.showToolbar ?? 'Show Toolbar'
          }
        }
      ]
    },

    {
      fieldGroupClassName: FORMLY_ROW,
      fieldGroup: [
        {
          className,
          key: 'exportExcel',
          type: 'toggle',
          templateOptions: {
            label: Widgets?.AnalyticalGrid?.exportExcel ?? 'Export Excel'
          }
        },
        {
          className,
          key: 'columnPinning',
          type: 'toggle',
          templateOptions: {
            label: Widgets?.AnalyticalGrid?.columnPinning ?? 'Column Pinning'
          }
        }
      ]
    },

    {
      fieldGroupClassName: FORMLY_ROW,
      fieldGroup: [
        {
          className,
          key: 'allowFiltering',
          type: 'toggle',
          templateOptions: { label: 'Allow Filtering' }
        },
        {
          className,
          key: 'filterMode',
          type: 'select',
          templateOptions: {
            label: 'Allow Filtering',
            options: [
              { value: 'quickFilter', label: 'Quick Filter' },
              { value: 'excelStyleFilter', label: 'Excel Style Filter' }
            ]
          }
        }
      ]
    },
    {
      fieldGroupClassName: FORMLY_ROW,
      key: 'column',
      wrappers: ['panel'],
      fieldGroup: [
        {
          className,
          key: 'resizable',
          type: 'checkbox',
          templateOptions: {
            label: 'Resizable'
          }
        },
        {
          className,
          key: 'width',
          type: 'input',
          templateOptions: {
            type: 'number',
            label: 'Width'
          }
        }
      ]
    }
  ]
}


export function AnalyticsAnnotationSchema(Widgets, dataSettings$: Observable<DataSettings>, entityType$: Observable<EntityType>) {
  return {
    key: 'analytics',
    fieldGroup: [
      {
        key: 'rows',
        type: 'array',
        templateOptions: {
          label: Widgets?.AnalyticalGrid?.Rows ?? 'Rows',
          hideDelete: true
        },
        fieldArray: {
          type: 'property-select',
          props: {
            required: true,
            removable: true,
            sortable: true,
            dataSettings: dataSettings$,
            entityType: entityType$,
            capacities: [
              PropertyCapacity.Dimension,
              PropertyCapacity.MeasureGroup,
              PropertyCapacity.Measure,
              PropertyCapacity.MeasureAttributes,
              PropertyCapacity.Order,
              FormlyPropertyCapacity.MeasureStyle,
              FormlyPropertyCapacity.MeasureStylePalette,
            ],
            colors: ColorPalettes
          }
        }
      },
      {
        key: 'columns',
        type: 'array',
        templateOptions: {
          label: Widgets?.AnalyticalGrid?.Columns ?? 'Columns',
          hideDelete: true
        },
        fieldArray: {
          type: 'property-select',
          templateOptions: {
            required: true,
            removable: true,
            sortable: true,
            dataSettings: dataSettings$,
            entityType: entityType$,
            capacities: [
              PropertyCapacity.Dimension,
              PropertyCapacity.MeasureGroup,
              PropertyCapacity.Measure,
              PropertyCapacity.MeasureAttributes,
              PropertyCapacity.Order,
              FormlyPropertyCapacity.MeasureStyle,
              FormlyPropertyCapacity.MeasureStylePalette,
              FormlyPropertyCapacity.MeasureStyleGridBar,
            ],
            colors: ColorPalettes
          }
        }
      }
    ]
  }
}
