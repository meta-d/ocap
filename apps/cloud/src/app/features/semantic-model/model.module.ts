import { NgModule } from '@angular/core'
import { MetadFormlyExpansionModule } from '@metad/formly-mat/expansion'
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

    /**
     * @deprecated use accordion
     */
    MetadFormlyExpansionModule
  ],
  providers: []
})
export class SemanticModelModule {}
