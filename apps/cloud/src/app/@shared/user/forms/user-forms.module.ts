import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { COMPONENTS } from './index'

@NgModule({
  imports: [FormsModule, ReactiveFormsModule, FormlyModule],
  exports: [...COMPONENTS],
  declarations: [...COMPONENTS],
  providers: []
})
export class UserFormsModule {}
