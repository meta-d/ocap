import { Injectable } from '@angular/core'
import { StoryWidget } from '@metad/story/core'
import { BaseDesignerSchemaService, BaseSchemaState } from '@metad/story/designer'
import { map } from 'rxjs/operators'

@Injectable()
export class KpiStylingSchema extends BaseDesignerSchemaService<BaseSchemaState<StoryWidget['styling']>> {
  getSchema() {
    return this.translate.stream('Story').pipe(
      map((STORY) => {
        return [
          {
            wrappers: ['expansion'],
            props: {
              label: STORY?.Widgets?.Common?.ComponentStyling ?? 'Component Styling',
              expanded: false
            },
            fieldGroup: [
              {
                key: 'component',
                type: 'styling',
                props: {
                }
              }
            ]
          },
          {
            wrappers: ['expansion'],
            props: {
              label: STORY?.Widgets?.Common?.TitleStyling ?? 'Title Styling',
              expanded: false
            },
            fieldGroup: [
              {
                key: 'title',
                type: 'styling',
                props: {
                }
              }
            ]
          },
          {
            wrappers: ['expansion'],
            props: {
              label: STORY?.Widgets?.Common?.ValueStyling ?? 'Value Styling',
              expanded: false
            },
            fieldGroup: [
              {
                key: 'value',
                type: 'styling',
                props: {
                }
              }
            ]
          },
        ]
      })
    )
  }
}
