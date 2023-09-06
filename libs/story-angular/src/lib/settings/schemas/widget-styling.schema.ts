import { Injectable } from '@angular/core'
import { StoryWidget } from '@metad/story/core'
import { Appearance, BaseDesignerSchemaService, BaseSchemaState, FORMLY_W_FULL } from '@metad/story/designer'
import { map } from 'rxjs/operators'

@Injectable()
export class WidgetStylingSchema extends BaseDesignerSchemaService<BaseSchemaState<StoryWidget['styling']>> {
  getSchema() {
    return this.translate.stream('Story').pipe(
      map((DESIGNER) => {
        return [
          {
            wrappers: ['expansion'],
            props: {
              label: DESIGNER?.Widgets?.Common?.ComponentStyling ?? 'Component Styling',
              expanded: true
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
          Appearance(FORMLY_W_FULL, DESIGNER?.Widgets?.Common)
          // StylingWidgetSchema(FORMLY_W_1_2, DESIGNER)
        ]
      })
    )
  }
}
