import { NgModule } from '@angular/core'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule, SharedModule } from '../../../@shared'
import { PACDataSourceCreationComponent } from './creation/creation.component'
import { PACDataSourcesRoutingModule } from './data-sources-routing.module'
import { PACDataSourcesComponent } from './data-sources.component'
import { NgmInputComponent } from '@metad/ocap-angular/common'

@NgModule({
  imports: [
    SharedModule,
    MaterialModule,
    FormlyModule,
    TranslateModule,
    PACDataSourcesRoutingModule,
    ContentLoaderModule,
    NgmInputComponent,

    ButtonGroupDirective,
    DensityDirective
  ],
  exports: [],
  declarations: [PACDataSourcesComponent, PACDataSourceCreationComponent ],
  providers: []
})
export class PACDataSourcesModule {}
