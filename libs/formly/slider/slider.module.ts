import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { MatCommonModule } from '@angular/material/core'
import { FormlyFieldSliderComponent } from './slider.type'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'slider',
          component: FormlyFieldSliderComponent
        }
      ]
    })
  ],
})
export class FormlyMatSliderModule {}
