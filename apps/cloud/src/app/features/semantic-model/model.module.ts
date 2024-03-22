import { NgModule } from '@angular/core'
import { MetadFormlyExpansionModule } from '@metad/formly-mat/expansion'
import { LoggerModule } from 'ngx-logger'
import { NgxPermissionsModule } from 'ngx-permissions'
import { provideLogger } from '../../@core'
import { MaterialModule, SharedModule } from '../../@shared'
import { SemanticModelRoutingModule } from './routing'

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
    MetadFormlyExpansionModule,

    LoggerModule
  ],
  providers: [provideLogger()]
})
export class SemanticModelModule {}
