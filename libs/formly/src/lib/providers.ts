import { PacFormlyColorsComponent } from '@metad/formly/colors'
import { NgmFormlyToggleComponent } from '@metad/formly/mat-toggle'
import { ConfigOption, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { FormlyFieldTextArea } from '@ngx-formly/material/textarea'

export function validateRequired(err, field: FormlyFieldConfig) {
  return `This field is required`
}
export function validateMinLength(err, field: FormlyFieldConfig) {
  return `Should have atleast ${field.props.minLength} characters`
}
export function validateMaxLength(err, field: FormlyFieldConfig) {
  return `Should have less than ${field.props.maxLength} characters`
}
export function validateMin(err, field: FormlyFieldConfig) {
  return 'This value should be more than ' + field.props.min
}
export function validateMax(err, field: FormlyFieldConfig) {
  return `This value should be less than ${field.props.max}`
}

export function provideFormly(options?: ConfigOption) {
  return FormlyModule.forRoot({
    validationMessages: [
      { name: 'required', message: validateRequired },
      { name: 'minLength', message: validateMinLength },
      { name: 'maxLength', message: validateMaxLength },
      { name: 'min', message: validateMin },
      { name: 'max', message: validateMax },
      ...(options?.validationMessages ?? [])
    ],
    types: [
      {
        name: 'colors',
        component: PacFormlyColorsComponent
      },
      ...(options?.types ?? [])
    ]
  }).providers
}

export function provideFormlyMaterial() {
  return [
    ...FormlyModule.forChild({
      types: [
        {
          name: 'toggle',
          component: NgmFormlyToggleComponent,
        },
        // {
        //   name: 'textarea',
        //   component: FormlyFieldTextArea,
        //   wrappers: ['form-field']
        // }
      ]
    }).providers
  ]
}
