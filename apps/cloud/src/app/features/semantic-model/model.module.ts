import { NgModule } from '@angular/core'
import { NgxPermissionsModule } from 'ngx-permissions'
import { MaterialModule, SharedModule } from '../../@shared'
import { SemanticModelRoutingModule } from './model-routing.module'

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    MaterialModule,
    SemanticModelRoutingModule,

    NgxPermissionsModule

    // // Formly
    // FormlyModule.forRoot({
    //   validationMessages: [{ name: 'required', message: 'This field is required' }]
    // }),
    // FormlyMatToggleModule,
    // MetadFormlyMatModule,
    // MetadFormlyEmptyModule,
    // PACFormlyMatSlicersModule,
    // PACFormlyPropertySelectModule,
    // PACFormlyCodeEditorModule,
    // FormlyMatCheckboxModule,
    // PACFormlyInputModule,
    // PACFormlySelectModule,
    // PACFormlyTextAreaModule
  ],
  providers: []
})
export class SemanticModelModule {}
