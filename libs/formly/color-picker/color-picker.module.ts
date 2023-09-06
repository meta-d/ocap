import { NgModule } from '@angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { PACFormlyColorPickerComponent } from './color-picker.component'

@NgModule({
  declarations: [],
  imports: [
    FormlyModule.forChild({
      types: [
        {
          name: 'color',
          component: PACFormlyColorPickerComponent,
          defaultOptions: {
            defaultValue: ''
          }
        }
      ]
    })
  ]
})
export class PACFormlyColorPickerModule {}
