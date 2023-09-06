import { AccordionWrappers, FORMLY_W_FULL } from "@metad/story/designer"

export function AriaCapacity(className: string, I18N?) {
  return AccordionWrappers([{
    key: 'aria',
    label: I18N.ARIA?.TITLE ?? 'Aria',
    fieldGroup: [
      {
        key: 'decal',
        fieldGroupClassName: 'nx-formly__row',
        fieldGroup: [
          {
            className,
            key: 'show',
            type: 'checkbox',
            templateOptions: {
              label: I18N?.ARIA?.ShowDecal ?? 'Show Decal'
            }
          },
          {
            className: FORMLY_W_FULL,
            key: 'decals',
            type: 'json',
            templateOptions: {
              label: I18N?.ARIA?.Decals || 'Decals',
              autosize: true
            }
          }
        ]
      }
    ]
  }])
}
