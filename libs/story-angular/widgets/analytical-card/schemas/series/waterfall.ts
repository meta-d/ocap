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
  Stacks
} from '../common'
import { LabelAccordionWrappers, LabelLineAccordionWrappers } from './label'

export function WaterfallCapacity(className: string, I18N) {
  return AccordionWrappers([
    {
      key: 'seriesStyle',
      label: I18N?.SeriesStyle?.Title ?? 'Series Attributes',
      fieldGroup: [
        {
          fieldGroupClassName: FORMLY_ROW,
          fieldGroup: [
            {
              className,
              key: 'accumulate',
              type: 'checkbox',
              props: {
                label: I18N?.Waterfall?.Accumulate ?? 'Accumulate'
              }
            },
            {
              className,
              key: 'barWidth',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarWidth ?? 'Bar Width',
                type: 'number',
                placeholder: 'barWidth'
              }
            },
            {
              className,
              key: 'barMaxWidth',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarMaxWidth ?? 'Bar Max Width',
                type: 'number',
                placeholder: 'barMaxWidth'
              }
            },
            {
              className,
              key: 'barMinWidth',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarMinWidth ?? 'Bar Min Width',
                type: 'number',
                placeholder: 'barMinWidth'
              }
            },
            {
              className,
              key: 'barMinHeight',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarMinHeight ?? 'Bar Min Height',
                type: 'number',
                placeholder: 'barMinHeight'
              }
            },
            {
              className,
              key: 'barMinAngle',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarMinAngle ?? 'Bar Min Angle',
                type: 'number',
                placeholder: 'barMinAngle'
              }
            },
            {
              className,
              key: 'barGap',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarGap ?? 'Bar Gap',
                placeholder: 'barGap'
              }
            },
            {
              className,
              key: 'barCategoryGap',
              type: 'input',
              props: {
                label: I18N?.Bar?.BarCategoryGap ?? 'Bar Category Gap',
                placeholder: 'barCategoryGap'
              }
            },
            ...Stacks(className, I18N),
            ...SeriesCommon(className, I18N).fieldGroup,
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
