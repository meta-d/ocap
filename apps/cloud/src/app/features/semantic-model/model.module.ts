import { NgModule } from '@angular/core'
import { MetadFormlyExpansionModule } from '@metad/formly-mat/expansion'
import { NgxPermissionsModule } from 'ngx-permissions'
import { MaterialModule, SharedModule } from '../../@shared'
import { SemanticModelRoutingModule } from './model-routing.module'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'

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

    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),
  ],
  providers: []
})
export class SemanticModelModule {}
