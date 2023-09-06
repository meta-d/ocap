import { CommonModule } from '@angular/common'
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field'
import { MatCommonModule } from '@angular/material/core'
import { FormlyFieldSliderComponent } from './slider.type'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'slider',
          component: FormlyFieldSliderComponent
        }
      ]
    })
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class FormlyMatSliderModule {}
