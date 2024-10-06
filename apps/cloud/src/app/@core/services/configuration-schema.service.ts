import { includes, upperFirst } from 'lodash-es'

export function convertConfigurationSchema(schema: any, i18n?: any) {
  const fields = []
  schema.order
    ?.map((name) => ({ name, property: schema.properties[name] }))
    .filter(({ property }) => !!property)
    .forEach(({ name, property }) => {
      fields.push(convertFormlyField(schema, name, property, i18n))
    })

  Object.keys(schema.properties)
    .filter((field) => !includes(schema.order, field))
    .map((name) => ({ name, property: schema.properties[name] }))
    .forEach(({ name, property }) => {
      fields.push(convertFormlyField(schema, name, property, i18n))
    })
  return fields
}

function convertFormlyField(
  schema: any,
  name: string,
  property: { type: string; extendedEnum: any[]; title: string; default: string, depend: string },
  i18n?: any
) {

  const label = property.title || upperFirst(name)
  let type = ''
  let inputType = null
  switch (property.type) {
    case 'string':
      if (property.extendedEnum) {
        type = 'select'
      } else {
        type = 'input'
        inputType = schema.secret?.includes(name) ? 'password' : 'text'
      }
      break
    case 'textarea':
      type = 'textarea'
      break
    case 'number':
      type = 'input'
      inputType = 'number'
      break
    case 'boolean':
      type = 'checkbox'
      break
    case 'toggle':
      type = 'toggle'
      break
    case 'object':
      return {
        key: name,
        fieldGroup: convertConfigurationSchema(property, i18n)
      }
  }

  const formField = {
    key: name,
    type,
    props: {
      label: i18n?.[label] ?? label,
      type: inputType,
      placeholder: property.default,
      floatLabel: 'always',
      appearance: 'fill',
      required: includes(schema.required, name),
      options: property.extendedEnum?.map((item) => ({ value: item.value, label: item.name, icon: item.icon })),
      autosize: type === 'textarea'
    },
    expressions: {}
  } as any

  if (property.depend) {
    formField.expressions.hide = `!model || !model.${property.depend}`
  }

  return formField
}
