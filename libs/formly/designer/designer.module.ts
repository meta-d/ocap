import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { PACFormlyDesignerComponent } from './designer.type'

@NgModule({
  declarations: [PACFormlyDesignerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,

    TranslateModule,
    AppearanceDirective,
    DensityDirective,
    
    FormlyModule.forChild({
      types: [
        {
          name: 'designer',
          component: PACFormlyDesignerComponent
        }
      ]
    })
  ]
})
export class PACFormlyDesignerModule {}
