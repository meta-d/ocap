import { Injectable, Injector } from '@angular/core'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { getEntityProperty } from '@metad/ocap-core'
import { DataSettingsSchemaService, SelectionVariant } from '@metad/story/designer'
import { GridSelectionMode } from 'igniteui-angular'
import { isNil, negate } from 'lodash-es'
import { combineLatest } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

@Injectable()
export class PivotGridSchemaService extends DataSettingsSchemaService {

  constructor(injector: Injector) {
    super(injector)
  }

  getSchema() {
    return this.translate.stream('STORY_DESIGNER').pipe(
      map((STORY_DESIGNER) => {
        this.STORY_DESIGNER = STORY_DESIGNER
        return this.getBuilderSchema()
      })
    )
  }

  getBuilderSchema() {

    const BUILDER = this.STORY_DESIGNER.BUILDER

    const dataSettings = this.generateDataSettingsSchema(
      BUILDER,
      this.analytics,
      SelectionVariant(BUILDER, this.dataSettings$)
    )
    // dataSettings.wrappers = ['expansion']
    // dataSettings.templateOptions.enableSelectFields = true

    const schema = [
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
              label: '标题',
              required: true
            }
          }
        ]
      },
      dataSettings,
      // {
      //   wrappers: ['expansion'],
      //   templateOptions: {
      //     label: '数据配置',
      //     enableSelectFields: true,
      //     expanded: true
      //   },
      //   fieldGroup: [
      //     dataSettings,
      //   ],
      // },
      {
        key: 'options',
        wrappers: ['expansion'],
        templateOptions: {
          label: BUILDER.PIVOT_GRID?.OPTIONS ?? 'Grid Options',
          expanded: true
        },
        fieldGroup: [...GridOptionsSchema(BUILDER)]
      }
    ]

    return schema
  }

  get analytics() {
    return {
      key: 'analytics',
      // defaultValue: C_FORMLY_INITIAL_VALUE,
      templateOptions: {
        label: '分析配置',
        icon: 'pivot_table_chart',
        required: true
      },
      fieldGroup: [
        {
          key: 'rows',
          type: 'array',
          templateOptions: {
            label: '行',
            hideDelete: true,
          },
          fieldArray: {
            type: 'property-select',
            templateOptions: {
              label: 'Dimension',
              placeholder: 'Select A Dimension',
              required: true,
              removable: true,
              sortable: true,
              showMeasures: true,
              dataSettings: this.dataSettings$,
              entityType: this.entityType$
            }
          }
        },
        {
          key: 'columns',
          type: 'array',
          templateOptions: {
            label: '列',
            hideDelete: true,
          },
          fieldArray: {
            type: 'property-select',
            templateOptions: {
              label: 'Column',
              placeholder: 'Select A Column',
              required: true,
              removable: true,
              sortable: true,
              showMeasures: true,
              dataSettings: this.dataSettings$,
              entityType: this.entityType$
            }
          }
        }
      ]
    }
  }

  get columns() {
    return {
      key: 'columns',
      type: 'accordion-array',
      templateOptions: {
        label: '列属性',
        key: 'name'
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          const rowsControl = field.parent.form.get('dataSettings').get('analytics').get('rows')
          const columnsControl = field.parent.form.get('dataSettings').get('analytics').get('columns')

          field.templateOptions.options = combineLatest([
            rowsControl.valueChanges.pipe(startWith(rowsControl.value)),
            columnsControl.valueChanges.pipe(startWith(columnsControl.value)),
            this.entityType$
          ]).pipe(
            map(([rows, columns, entityType]) => {
              return [...rows, ...columns]
                .map((propertyPath) => getEntityProperty(entityType, propertyPath))
                .filter(negate(isNil))
                .map((property) => {
                  return { value: property.name, label: property.label || property.name }
                })
            })
          )
        }
      },
      fieldArray: {
        templateOptions: {
          label: '列属性'
        },
        fieldGroup: [
          {
            fieldGroupClassName: 'nx-formly__row',
            fieldGroup: [
              {
                className: 'nx-formly__col nx-formly__col-6',
                key: 'filterable',
                type: 'toggle',
                templateOptions: { label: 'Column Filterable' }
              },
              {
                className: 'nx-formly__col nx-formly__col-6',
                key: 'groupable',
                type: 'toggle',
                templateOptions: { label: 'Column Groupable' }
              }
            ]
          },
          {
            key: 'semantic',
            type: 'code-editor',
            templateOptions: { label: 'Column Semantics' }
          }
        ]
      }
    }
  }
}


export function GridOptionsSchema(BUILDER) {

  return [
    {
      fieldGroupClassName: 'nx-formly__row',
      fieldGroup: [
        // displayDensity(),
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'showToolbar',
          type: 'toggle',
          templateOptions: {
            label: BUILDER.PIVOT_GRID?.showToolbar ?? 'Show Toolbar'
          }
        }
      ]
    },

    {
      fieldGroupClassName: 'nx-formly__row',
      fieldGroup: [
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'exportExcel',
          type: 'toggle',
          templateOptions: {
            label: BUILDER.PIVOT_GRID?.exportExcel ?? 'Export Excel'
          }
        },
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'columnPinning',
          type: 'toggle',
          templateOptions: {
            label: BUILDER.PIVOT_GRID?.columnPinning ?? 'Column Pinning'
          }
        }
      ]
    },

    {
      fieldGroupClassName: 'nx-formly__row',
      fieldGroup: [
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'allowFiltering',
          type: 'toggle',
          templateOptions: { label: 'Allow Filtering' }
        },
        {
          className: 'nx-formly__col nx-formly__col-6',
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
      fieldGroupClassName: 'nx-formly__row',
      fieldGroup: [
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'paging',
          type: 'checkbox',
          templateOptions: {
            label: '是否分页'
          }
        },
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'pageSize',
          type: 'input',
          templateOptions: {
            type: 'number',
            label: '每页行数'
          }
        }
      ]
    },

    {
      key: 'columnSelection',
      type: 'select',
      templateOptions: {
        label: BUILDER?.PIVOT_GRID?.ColumnSelection ?? 'Column Selection',
        options: [
          { value: GridSelectionMode.none, label: 'None' },
          { value: GridSelectionMode.single, label: 'Single' },
          { value: GridSelectionMode.multiple, label: 'Multiple' }
        ]
      }
    },

    {
      fieldGroupClassName: 'nx-formly__row',
      key: 'column',
      wrappers: ['panel'],
      fieldGroup: [
        {
          className: 'nx-formly__col nx-formly__col-6',
          key: 'resizable',
          type: 'checkbox',
          templateOptions: {
            label: 'Resizable'
          }
        },
        {
          className: 'nx-formly__col nx-formly__col-6',
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
