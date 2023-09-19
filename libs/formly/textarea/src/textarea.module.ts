import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyFieldTextAreaComponent } from './textarea.type'

@NgModule({
  declarations: [FormlyFieldTextAreaComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatInputModule,

    FormlyModule.forChild({
      types: [
        {
          name: 'textarea',
          component: FormlyFieldTextAreaComponent
        }
      ]
    })
  ]
})
export class PACFormlyTextAreaModule {}
