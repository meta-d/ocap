import { Injectable } from '@angular/core'
import { StoryWidget } from '@metad/story/core'
import {
  AccordionWrappers,
  Appearance,
  BaseDesignerSchemaService,
  BaseSchemaState,
  FORMLY_ROW,
  FORMLY_W_1_2,
  FORMLY_W_FULL
} from '@metad/story/designer'
import { map } from 'rxjs/operators'

@Injectable()
export class AnalyticalGridStylingSchema extends BaseDesignerSchemaService<BaseSchemaState<StoryWidget['styling']>> {
  getSchema() {
    return this.translate.stream('Story.Widgets').pipe(
      map((i18n) => {
        return [
          {
            wrappers: ['expansion'],
            props: {
              label: i18n?.Common?.ComponentStyling ?? 'Component Styling',
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
          Appearance(FORMLY_W_FULL, i18n?.Common),
          ...AccordionWrappers([
            {
              key: 'bar',
              label: i18n?.AnalyticalGrid?.Bar ?? 'Bar',
              fieldGroup: [
                {
                  fieldGroupClassName: FORMLY_ROW,
                  fieldGroup: [
                    {
                      className: FORMLY_W_1_2,
                      key: 'backgroundColor',
                      type: 'color',
                      props: {
                        label: i18n?.Common?.BackgroundColor ?? 'Background Color'
                      }
                    }
                  ]
                }
              ]
            }
          ])
        ]
      })
    )
  }
}
