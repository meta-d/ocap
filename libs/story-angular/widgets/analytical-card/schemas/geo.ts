import { ItemStyle } from './common'

export function GeoCapacity(className: string, I18N) {
  const showKey = '__showGeo__'
  return [
    {
      key: showKey,
      type: 'empty'
    },
    {
      wrappers: ['accordion'],
      templateOptions: {
        elevationZ: true
      },
      fieldGroup: [
        {
          key: 'geo',
          hideExpression: `!field.parent.model || !field.parent.model.` + showKey,
          templateOptions: {
            label: I18N.Geo?.Title ?? 'Geo',
            keyShow: showKey
          },
          fieldGroupClassName: 'nx-formly__row',
          fieldGroup: [ItemStyle(className, I18N)]
        }
      ]
    }
  ]
}
