import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { PACFormlyChartTypeModule } from '@metad/formly/chart-type'
import { PACFormlyCodeEditorModule } from '@metad/formly/code-editor'
import { PACFormlyPropertySelectModule } from '@metad/formly/property-select'
import { PACFormlyMatSlicersModule } from '@metad/formly/slicers'

export function validateRequired(err, field: FormlyFieldConfig) {
  return `This field is required`
}
export function validateMinLength(err, field: FormlyFieldConfig) {
  return `Should have atleast ${field.templateOptions.minLength} characters`
}
export function validateMaxLength(err, field: FormlyFieldConfig) {
  return `Should have less than ${field.templateOptions.maxLength} characters`
}
export function validateMin(err, field: FormlyFieldConfig) {
  return 'This value should be more than ' + field.templateOptions.min
}
export function validateMax(err, field: FormlyFieldConfig) {
  return `This value should be less than ${field.templateOptions.max}`
}

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    PACFormlyPropertySelectModule,
    PACFormlyCodeEditorModule,
    PACFormlyChartTypeModule,
    PACFormlyMatSlicersModule
  ]
})
export class PACFormlyModule {
  static forRoot(): ModuleWithProviders<PACFormlyModule> {
    return {
      ngModule: PACFormlyModule,
      providers: [
        ...FormlyModule.forRoot({
          validationMessages: [
            { name: 'required', message: validateRequired },
            { name: 'minlength', message: validateMinLength },
            { name: 'maxlength', message: validateMaxLength },
            { name: 'min', message: validateMin },
            { name: 'max', message: validateMax }
          ]
        }).providers
      ]
    }
  }
}
