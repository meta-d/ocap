import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { PACFormlySelectComponent } from './select.type'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FormlyModule.forChild({
      types: [
        {
          name: 'select-inline',
          component: PACFormlySelectComponent
        },
        {
          name: 'select',
          extends: 'select-inline',
        },
        {
          name: 'nx-select',
          extends: 'select',
          defaultOptions: {
            props: {
              virtualScroll: true
            }
          }
        },
      ]
    })
  ]
})
export class PACFormlySelectModule {}
