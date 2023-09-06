import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AppearanceDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxFormlyArrayComponent } from './array.type'

@NgModule({
  declarations: [NxFormlyArrayComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    AppearanceDirective,

    FormlyModule.forChild({
      types: [
        {
          name: 'array',
          component: NxFormlyArrayComponent,
        },
      ],
    }),
  ],
  exports: [NxFormlyArrayComponent],
})
export class PACFormlyArrayModule {}
