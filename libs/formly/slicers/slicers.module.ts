import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { FormlyModule } from '@ngx-formly/core'
import { NxSelectionModule } from '@metad/components/selection'
import { PACFormlySlicersComponent } from './slicers.type'

@NgModule({
  declarations: [PACFormlySlicersComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    NxSelectionModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'slicers',
          component: PACFormlySlicersComponent
        }
      ]
    })
  ],
  exports: [PACFormlySlicersComponent]
})
export class PACFormlyMatSlicersModule {}
