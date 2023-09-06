import { NgModule } from '@angular/core'
import { NgmMemberListComponent } from './member-list/member-list.component'
import { NgmMemberTableComponent } from './member-table/member-table.component'
import { NgmMemberTreeComponent } from './member-tree/member-tree.component'
import { NgmSmartFilterComponent } from './smart-filter/smart-filter.component'
import { NgmSmartSelectComponent } from './smart-select/smart-select.component'
import { NgmMemberTreeSelectComponent } from './tree-select/tree-select.component'
import { NgmValueHelpComponent } from './value-help/value-help.component'

@NgModule({
  imports: [
    NgmMemberListComponent,
    NgmSmartFilterComponent,
    NgmSmartSelectComponent,
    NgmMemberTreeComponent,
    NgmMemberTableComponent,
    NgmMemberTreeSelectComponent,
    NgmValueHelpComponent
  ],
  exports: [
    NgmMemberListComponent,
    NgmSmartFilterComponent,
    NgmSmartSelectComponent,
    NgmMemberTreeComponent,
    NgmMemberTableComponent,
    NgmMemberTreeSelectComponent,
    NgmValueHelpComponent
  ],
  declarations: [],
  providers: []
})
export class ControlsModule {}
