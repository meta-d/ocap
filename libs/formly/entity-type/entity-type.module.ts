import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { PACFormlyEntityTypeComponent } from './entity-type.component'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FormlyModule.forChild({
      types: [
        {
          name: 'entity-type',
          component: PACFormlyEntityTypeComponent
        },
      ]
    })
  ]
})
export class PACFormlyEntityTypeModule {}
