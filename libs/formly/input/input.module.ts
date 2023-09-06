import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { PACFormlyInputComponent } from './input.type'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FormlyModule.forChild({
      types: [
        {
          name: 'input-inline',
          component: PACFormlyInputComponent
        },
        {
          name: 'input',
          extends: 'input-inline',
        },
        {
          name: 'number',
          extends: 'input-inline',
          defaultOptions: {
            props: {
              type: 'number'
            }
          }
        },
      ]
    })
  ]
})
export class PACFormlyInputModule {}
