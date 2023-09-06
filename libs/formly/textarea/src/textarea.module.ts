import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyFieldTextArea } from './textarea.type'

@NgModule({
  declarations: [FormlyFieldTextArea],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatInputModule,

    FormlyModule.forChild({
      types: [
        {
          name: 'textarea',
          component: FormlyFieldTextArea
        }
      ]
    })
  ]
})
export class PACFormlyTextAreaModule {}
