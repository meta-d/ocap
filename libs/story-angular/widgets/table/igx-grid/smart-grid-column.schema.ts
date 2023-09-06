import { Injectable, Injector } from '@angular/core'
import { DesignerSchemaService } from '@metad/story/designer'

@Injectable()
export class SmartGridColumnSchema extends DesignerSchemaService {

  constructor(injector: Injector) {
    super(injector)
  }

  getBuilderSchema() {
    return [
      {
        wrappers: ['panel'],
        templateOptions: {
          padding: true
        },
        fieldGroup: [
          {
            fieldGroupClassName: 'nx-formly__row',
            fieldGroup: [
              {
                className: 'nx-formly__col nx-formly__col-6',
                key: 'filterable',
                type: 'toggle',
                templateOptions: { label: 'Filterable' },
              },
              {
                className: 'nx-formly__col nx-formly__col-6',
                key: 'groupable',
                type: 'toggle',
                templateOptions: { label: 'Groupable' },
              },
              {
                className: 'nx-formly__col nx-formly__col-6',
                key: 'sortable',
                type: 'toggle',
                templateOptions: { label: 'Sortable' },
              },
            ]
          },
          {
            key: 'semantic',
            type: 'code-editor',
            templateOptions: { label: 'Column Semantics' },
          }
        ]
      }
    ] as any
  }

  getStylingSchema() {
    return []
  }
}
