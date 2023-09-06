import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { NgmSelectModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { PACFormlySemanticModelComponent } from './semantic-model.type'

@NgModule({
  declarations: [PACFormlySemanticModelComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    NgmSelectModule,
    OcapCoreModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'semantic-model',
          component: PACFormlySemanticModelComponent
        }
      ]
    })
  ],
  exports: [PACFormlySemanticModelComponent]
})
export class PACFormlySemanticModelModule {}
