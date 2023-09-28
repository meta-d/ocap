import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { NgmFormlyAccordionModule } from '@metad/formly/accordion'
import { PACFormlyButtonToggleModule } from '@metad/formly/button-toggle'
import { PACFormlyChartTypeModule } from '@metad/formly/chart-type'
import { FormlyMatCheckboxModule } from '@metad/formly/checkbox'
import { PACFormlyCodeEditorModule } from '@metad/formly/code-editor'
import { PACFormlyColorPickerModule } from '@metad/formly/color-picker'
import { PacFormlyColorsComponent } from '@metad/formly/colors'
import { PACFormlyDesignerModule } from '@metad/formly/designer'
import { PACFormlyEmptyModule } from '@metad/formly/empty'
import { PACFormlyEntityTypeModule } from '@metad/formly/entity-type'
import { PACFormlyInputModule } from '@metad/formly/input'
import { PACFormlyJsonModule } from '@metad/formly/json'
import { PACFormlyTableModule } from '@metad/formly/mat-table'
import { FormlyMatToggleModule } from '@metad/formly/mat-toggle'
import { PACFormlyPropertySelectModule } from '@metad/formly/property-select'
import { PACFormlySelectModule } from '@metad/formly/select'
import { PACFormlySemanticModelModule } from '@metad/formly/semantic-model'
import { PACFormlyMatSlicersModule } from '@metad/formly/slicers'
import { FormlyMatSliderModule } from '@metad/formly/slider'
import { PACFormlySortModule } from '@metad/formly/sort'
import { PACFormlyTextAreaModule } from '@metad/formly/textarea'
import { NgmFormlyArrayModule } from '@metad/formly/array'
import { ConfigOption, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { MetadFormlyPanelModule } from '@metad/formly-mat/panel'
import { MetadFormlyMatTabGroupModule } from '@metad/formly-mat/tab-group'

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

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    PACFormlyJsonModule,
    FormlyMatToggleModule,
    FormlyMatSliderModule,
    PACFormlyChartTypeModule,
    PACFormlyMatSlicersModule,
    PACFormlyPropertySelectModule,
    PACFormlyCodeEditorModule,
    PACFormlyDesignerModule,
    PACFormlyEmptyModule,
    PACFormlyButtonToggleModule,
    PACFormlyTableModule,
    PACFormlyInputModule,
    PACFormlySelectModule,
    FormlyMatCheckboxModule,
    PACFormlyTextAreaModule,
    PACFormlySemanticModelModule,
    PACFormlySortModule,
    PACFormlyColorPickerModule,
    PACFormlyEntityTypeModule,
    MetadFormlyPanelModule,
    MetadFormlyMatTabGroupModule,

    NgmFormlyArrayModule,
    NgmFormlyAccordionModule
  ]
})
export class NgmFormlyModule {
  static forRoot(options?: ConfigOption): ModuleWithProviders<NgmFormlyModule> {
    return {
      ngModule: NgmFormlyModule,
      providers: [
        ...FormlyModule.forRoot({
          validationMessages: [
            { name: 'required', message: validateRequired },
            { name: 'minlength', message: validateMinLength },
            { name: 'maxlength', message: validateMaxLength },
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
      ]
    }
  }
}
