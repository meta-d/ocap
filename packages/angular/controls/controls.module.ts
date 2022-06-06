import { DragDropModule } from '@angular/cdk/drag-drop'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatTreeModule } from '@angular/material/tree'
import {MatTableModule} from '@angular/material/table'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatDialogModule} from '@angular/material/dialog'
import { NgmCommonModule, TableVirtualScrollModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { MemberTableComponent } from './member-table/member-table.component'
import { MemberTreeComponent } from './member-tree/member-tree.component'
import { SmartFilterComponent } from './smart-filter/smart-filter.component'
import { ValueHelpDialog } from './value-help/value-help.component'
import { TranslateModule } from '@ngx-translate/core'
import { MatDividerModule } from '@angular/material/divider'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatListModule } from '@angular/material/list'


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
    DragDropModule,
    ScrollingModule,
    TranslateModule,

    NgmCommonModule,
    OcapCoreModule,
    TableVirtualScrollModule
  ],
  exports: [SmartFilterComponent, MemberTreeComponent, MemberTableComponent, ValueHelpDialog],
  declarations: [SmartFilterComponent, MemberTreeComponent, MemberTableComponent, ValueHelpDialog],
  providers: []
})
export class ControlsModule {}
