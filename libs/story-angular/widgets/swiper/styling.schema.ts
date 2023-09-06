import { Injectable } from '@angular/core'
import { StoryWidget } from '@metad/story/core'
import { Appearance, BaseDesignerSchemaService, BaseSchemaState, FORMLY_W_FULL } from '@metad/story/designer'
import { map } from 'rxjs/operators'

@Injectable()
export class SlideStylingSchema extends BaseDesignerSchemaService<BaseSchemaState<StoryWidget['styling']>> {
  getSchema() {
    return this.translate.stream('Story').pipe(
      map((STORY) => {
        return [
          {
            wrappers: ['expansion'],
            props: {
              label: STORY?.Widgets?.Common?.ComponentStyling ?? 'Component Styling',
              expanded: true
            },
            fieldGroup: [
              {
                key: 'component',
                type: 'styling',
                props: {}
              }
            ]
          },
          {
            wrappers: ['expansion'],
            props: {
              label: STORY?.Widgets?.Common?.SlideStyling ?? 'Slide Styling',
              expanded: false
            },
            fieldGroup: [
              {
                key: 'slide',
                type: 'styling',
                props: {}
              }
            ]
          },
          Appearance(FORMLY_W_FULL, STORY?.Widgets?.Common)
        ]
      })
    )
  }
}
