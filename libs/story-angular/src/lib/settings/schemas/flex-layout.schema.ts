import { Injectable } from '@angular/core'
import { BackgroundProperties, BaseDesignerSchemaService, BaseSchemaState, FORMLY_W_1_2 } from '@metad/story/designer'
import { of } from 'rxjs'

@Injectable()
export class FlexLayoutSchemaService extends BaseDesignerSchemaService<BaseSchemaState> {

  getSchema() {
    return of([
      {
        wrappers: ['expansion'],
        templateOptions: {
          label: '响应页面',
          expanded: true
        },
        fieldGroup: [
          {
            key: 'key',
            type: 'empty',
          },
          {
            fieldGroupClassName: 'nx-formly__row',
            fieldGroup: [
              {
                key: 'direction',
                type: 'select',
                className: 'nx-formly__col nx-formly__col-6',
                templateOptions: {
                  label: '响应页面',
                  options: [
                    { value: 'row', label: '行' },
                    { value: 'column', label: '列' }
                  ]
                }
              },
              {
                key: 'wrap',
                type: 'toggle',
                defaultValue: true,
                className: 'nx-formly__col nx-formly__col-6',
                templateOptions: {
                  label: 'Wrap'
                }
              }
            ]
          },
          {
            key: 'styles',
            fieldGroup: [
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'justify-content',
                    type: 'select',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Justify Content',
                      options: [
                        { value: 'flex-start', label: 'Flex Start' },
                        { value: 'flex-end', label: 'Flex End' },
                        { value: 'center', label: 'Center' },
                        { value: 'space-between', label: 'Space Btween' },
                        { value: 'space-around', label: 'Space Around' },
                        { value: 'space-evenly', label: 'Space Evenly' }
                      ]
                    }
                  },
                  {
                    key: 'align-items',
                    type: 'select',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Align Items',
                      options: [
                        { value: 'flex-start', label: 'Flex Start' },
                        { value: 'flex-end', label: 'Flex End' },
                        { value: 'center', label: 'Center' },
                        { value: 'stretch', label: 'Stretch' }
                      ]
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'align-content',
                    type: 'select',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Align Content',
                      options: [
                        { value: 'flex-start', label: 'Flex Start' },
                        { value: 'flex-end', label: 'Flex End' },
                        { value: 'center', label: 'Center' },
                        { value: 'space-between', label: 'Space Btween' },
                        { value: 'space-around', label: 'Space Around' },
                        { value: 'space-evenly', label: 'Space Evenly' }
                      ]
                    }
                  },
                  {
                    key: 'align-items',
                    type: 'select',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Align Items',
                      options: [
                        { value: 'flex-start', label: 'Flex Start' },
                        { value: 'flex-end', label: 'Flex End' },
                        { value: 'center', label: 'Center' },
                        { value: 'stretch', label: 'Stretch' }
                      ]
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'align-self',
                    type: 'select',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Align Self',
                      options: [
                        { value: 'auto', label: 'Auto' },
                        { value: 'flex-start', label: 'Flex Start' },
                        { value: 'flex-end', label: 'Flex End' },
                        { value: 'center', label: 'Center' },
                        { value: 'baseline', label: 'Baseline' },
                        { value: 'stretch', label: 'Stretch' }
                      ]
                    }
                  },
                  {
                    key: 'order',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Order',
                      type: 'number'
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'flex-grow',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-4',
                    templateOptions: {
                      label: 'Flex Grow',
                      type: 'number'
                    }
                  },
                  {
                    key: 'flex-shrink',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-4',
                    templateOptions: {
                      label: 'Flex Shrink',
                      type: 'number'
                    }
                  },
                  {
                    key: 'flex-basis',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-4',
                    templateOptions: {
                      label: 'Flex Basis'
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'width',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Width'
                    }
                  },
                  {
                    key: 'height',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Height'
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'max-width',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Max Width'
                    }
                  },
                  {
                    key: 'max-height',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Max Height'
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'nx-formly__row',
                fieldGroup: [
                  {
                    key: 'margin',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Margin'
                    }
                  },
                  {
                    key: 'padding',
                    type: 'input',
                    className: 'nx-formly__col nx-formly__col-6',
                    templateOptions: {
                      label: 'Padding'
                    }
                  }
                ]
              },
              ...BackgroundProperties(FORMLY_W_1_2)
            ]
          }
        ]
      }
    ])
  }
}
