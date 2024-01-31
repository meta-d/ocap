import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NxEditorModule } from '@metad/components/editor'
import { NgmCommonModule, NgmTableComponent, ResizerModule, SplitterModule } from '@metad/ocap-angular/common'
import { NgmCopilotChatComponent } from '@metad/ocap-angular/copilot'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { MaterialModule, SharedModule } from 'apps/cloud/src/app/@shared'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { QueryLabRoutingModule } from './query-lab-routing.module'
import { QueryLabComponent } from './query-lab.component'
import { QueryComponent } from './query/query.component'

@NgModule({
  imports: [
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,

    NxEditorModule,
    NgmTableComponent,
    OcapCoreModule,
    ResizerModule,
    SplitterModule,
    NgmEntitySchemaComponent,
    NgxPopperjsModule,
    NgmCopilotChatComponent,
    NgmCommonModule,

    QueryLabRoutingModule
  ],
  exports: [QueryLabComponent, QueryComponent],
  declarations: [QueryLabComponent, QueryComponent],
  providers: []
})
export class QueryLabModule {}
