import { Injectable, Injector } from '@angular/core'
import { StoryPoint } from '@metad/story/core'
import { BaseDesignerSchemaService, SchemaState } from '@metad/story/designer'
import { map } from 'rxjs/operators'
import { gridsterOptions } from './types'

export interface StoryPointSchemaState extends SchemaState {
  model: {
    gridOptions: StoryPoint['gridOptions']
  }
}

@Injectable()
export class StoryPointBuilderSchema extends BaseDesignerSchemaService<StoryPointSchemaState> {
  constructor(injector: Injector) {
    super(injector)
  }

  getSchema() {
    return this.translate.stream('Story').pipe(
      map((Story) => {
        return [this.getGridOptions(Story?.GridOptions)]
      })
    )
  }

  getGridOptions(I18NGridOptions) {
    const className = 'ngm-formly__col ngm-formly__col-6'
    return {
      key: 'gridOptions',
      wrappers: ['expansion'],
      props: {
        label: I18NGridOptions?.TITLE ?? 'Grid Layout',
        expanded: true
      },
      fieldGroup: [
        {
          fieldGroupClassName: 'ngm-formly__row',
          fieldGroup: gridsterOptions(className, I18NGridOptions)
        }
      ]
    }
  }
}
