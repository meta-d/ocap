import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ArrayInputComponent } from './array-input/array-input.component'

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ArrayInputComponent],
  declarations: [ArrayInputComponent],
  providers: []
})
export class PACFormFieldModule {}
