import { NgModule } from '@angular/core'
import { MetadFormlyMatModule } from '@metad/formly-mat'
import { MetadFormlyEmptyModule } from '@metad/formly-mat/empty'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMatCheckboxModule } from '@metad/formly/checkbox'
import { PACFormlyCodeEditorModule } from '@metad/formly/code-editor'
import { PACFormlyInputModule } from '@metad/formly/input'
import { FormlyMatToggleModule } from '@metad/formly/mat-toggle'
import { PACFormlyPropertySelectModule } from '@metad/formly/property-select'
import { PACFormlySelectModule } from '@metad/formly/select'
import { PACFormlyMatSlicersModule } from '@metad/formly/slicers'
import { PACFormlyTextAreaModule } from '@metad/formly/textarea'
import { NgxPermissionsModule } from 'ngx-permissions'
import { MaterialModule, SharedModule } from '../../@shared'
import { SemanticModelRoutingModule } from './model-routing.module'

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    MaterialModule,
    SemanticModelRoutingModule,

    NgxPermissionsModule,

    // Formly
    FormlyModule.forRoot({
      validationMessages: [{ name: 'required', message: 'This field is required' }]
    }),
    FormlyMatToggleModule,
    MetadFormlyMatModule,
    MetadFormlyEmptyModule,
    PACFormlyMatSlicersModule,
    PACFormlyPropertySelectModule,
    PACFormlyCodeEditorModule,
    FormlyMatCheckboxModule,
    PACFormlyInputModule,
    PACFormlySelectModule,
    PACFormlyTextAreaModule
  ],
  providers: []
})
export class SemanticModelModule {}
