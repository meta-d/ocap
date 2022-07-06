import { DragDropModule } from '@angular/cdk/drag-drop'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTableModule } from '@angular/material/table'
import { MatTreeModule } from '@angular/material/tree'
import { NgmCommonModule, TableVirtualScrollModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MemberListComponent } from './member-list/member-list.component'
import { MemberTableComponent } from './member-table/member-table.component'
import { MemberTreeComponent } from './member-tree/member-tree.component'
import { SmartFilterComponent } from './smart-filter/smart-filter.component'
import { MemberTreeSelectComponent } from './tree-select/tree-select.component'
import { ValueHelpDialog } from './value-help/value-help.component'

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTreeModule,
    MatTableModule,
    MatDialogModule,
    MatDividerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatListModule,
    MatProgressSpinnerModule,
    DragDropModule,
    ScrollingModule,
    TranslateModule,

    NgmCommonModule,
    OcapCoreModule,
    TableVirtualScrollModule
  ],
  exports: [
    SmartFilterComponent,
    MemberTreeComponent,
    MemberTableComponent,
    MemberListComponent,
    MemberTreeSelectComponent,
    ValueHelpDialog
  ],
  declarations: [
    SmartFilterComponent,
    MemberTreeComponent,
    MemberTableComponent,
    MemberListComponent,
    MemberTreeSelectComponent,
    ValueHelpDialog
  ],
  providers: []
})
export class ControlsModule {}
