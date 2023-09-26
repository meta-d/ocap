import { AccordionWrappers, FORMLY_ROW } from '@metad/story/designer'
import {
  Borders,
  EmphasisAccordionWrappers,
  ItemStyleAccordionWrappers,
  MarkLineExpansion,
  Opacity,
  SelectExpansion,
  SeriesCommon,
  Shadows,
  SingleColor,
  Symbols
} from '../common'
import { LabelAccordionWrappers, LabelLayoutAccordionWrappers, LabelLineAccordionWrappers } from './label'

export function ScatterCapacity(className: string, I18N) {
  return AccordionWrappers([
    {
      key: 'seriesStyle',
      label: I18N?.SeriesStyle?.Title ?? 'Series Attributes',
      fieldGroup: [
        {
          fieldGroupClassName: FORMLY_ROW,
          fieldGroup: [
            ...SeriesCommon(className, I18N).fieldGroup,
            ...Symbols(className, I18N),
            {
              className,
              key: 'roundCap',
              type: 'checkbox',
              props: {
                label: I18N?.Bar?.RoundCap ?? 'Round Cap'
              }
            }
          ]
        },

        ...ItemStyleAccordionWrappers(className, I18N),
        ...LabelAccordionWrappers(className, I18N),
        ...LabelLineAccordionWrappers(className, I18N),
        ...LabelLayoutAccordionWrappers(className, I18N),
        ...EmphasisAccordionWrappers(className, I18N),
        {
          key: '__showSelect__',
          type: 'empty'
        },
        {
          key: '__showMarkLine__',
          type: 'empty'
        },
        {
          key: 'showBackground',
          type: 'empty'
        },
        {
          wrappers: ['accordion'],
          props: {
            elevationZ: true
          },
          fieldGroup: [
            SelectExpansion(className, I18N, '__showSelect__'),
            MarkLineExpansion(className, I18N, '__showMarkLine__'),
            BackgroundStyleExpansion(className, I18N, 'showBackground')
          ]
        }
      ]
    }
  ])
}

function BackgroundStyleExpansion(className: string, I18N, keyShow: string) {
  return {
    key: 'backgroundStyle',
    hideExpression: `!field.parent && !field.parent.model.` + keyShow,
    props: {
      label: I18N?.Bar?.Background ?? 'Background',
      toggleable: true,
      keyShow: keyShow
    },
    fieldGroupClassName: FORMLY_ROW,
    fieldGroup: [
      SingleColor(className, I18N),
      ...Borders(className, I18N),
      ...Shadows(className, I18N),
      Opacity(className, I18N)
    ]
  }
}
