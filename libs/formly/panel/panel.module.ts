import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { FormlyModule } from '@ngx-formly/core'
import { MetadFormlyPanelComponent } from './panel.type'

@NgModule({
  declarations: [MetadFormlyPanelComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    FormlyModule.forChild({
      wrappers: [{ name: 'panel', component: MetadFormlyPanelComponent }]
    })
  ],
  exports: [MetadFormlyPanelComponent]
})
export class MetadFormlyPanelModule {}
