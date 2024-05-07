import { NgModule } from '@angular/core'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
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

    LoggerModule
  ],
  providers: [provideLogger()]
})
export class SemanticModelModule {}
