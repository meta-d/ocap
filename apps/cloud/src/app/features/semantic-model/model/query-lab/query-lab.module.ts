import { NgModule } from '@angular/core'
import { NgmCommonModule, ResizerModule, SplitterModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { NxEditorModule } from '@metad/components/editor'
import { NxTableModule } from '@metad/components/table'
import { CopilotChatComponent, MaterialModule, SharedModule } from 'apps/cloud/src/app/@shared'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { QueryLabRoutingModule } from './query-lab-routing.module'
import { QueryLabComponent } from './query-lab.component'
import { QueryComponent } from './query/query.component'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  imports: [
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,

    NxEditorModule,
    NxTableModule,
    OcapCoreModule,
    ResizerModule,
    SplitterModule,
    NgmEntitySchemaComponent,
    NgxPopperjsModule,
    CopilotChatComponent,
    NgmCommonModule,
    
    QueryLabRoutingModule
  ],
  exports: [QueryLabComponent, QueryComponent],
  declarations: [QueryLabComponent, QueryComponent],
  providers: []
})
export class QueryLabModule {}
