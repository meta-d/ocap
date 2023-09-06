import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormlyModule } from '@ngx-formly/core'
import { ReactiveFormsModule } from '@angular/forms'
import { PACFormlyJsonComponent } from './json.type'
import { MatInputModule } from '@angular/material/input'

@NgModule({
  declarations: [PACFormlyJsonComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,

    FormlyModule.forChild({
      types: [
        {
          name: 'json',
          component: PACFormlyJsonComponent
        }
      ]
    })
  ]
})
export class PACFormlyJsonModule {}
