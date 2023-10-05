import { Injectable } from '@angular/core'
import { StoryWidget } from '@metad/story/core'
import { BaseDesignerSchemaService, BaseSchemaState } from '@metad/story/designer'
import { map } from 'rxjs/operators'

@Injectable()
export class KpiStylingSchema extends BaseDesignerSchemaService<BaseSchemaState<StoryWidget['styling']>> {
  getSchema() {
    return this.translate.stream('Story').pipe(
      map((STORY) => [
        {
          wrappers: ['accordion'],
          props: {
            expandedMulti: true,
            elevationZ: true
          },
          fieldGroup: [
            {
              key: 'component',
              type: 'styling',
              props: {
                label: STORY?.Widgets?.Common?.ComponentStyling ?? 'Component Styling',
                expanded: false
              }
            },
            {
              key: 'title',
              type: 'styling',
              props: {
                label: STORY?.Widgets?.Common?.TitleStyling ?? 'Title Styling',
                expanded: false
              }
            },
            {
              key: 'value',
              type: 'styling',
              props: {
                label: STORY?.Widgets?.Common?.ValueStyling ?? 'Value Styling',
                expanded: false
              }
            }
          ]
        }
      ])
    )
  }
}
