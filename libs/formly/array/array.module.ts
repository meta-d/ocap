import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgmFormlyArrayComponent } from './array.type'

@NgModule({
  declarations: [NgmFormlyArrayComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    AppearanceDirective,
    DensityDirective,

    FormlyModule.forChild({
      types: [
        {
          name: 'array',
          component: NgmFormlyArrayComponent,
        },
      ],
    }),
  ],
  exports: [NgmFormlyArrayComponent],
})
export class NgmFormlyArrayModule {}
