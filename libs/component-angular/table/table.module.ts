import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { NxCoreModule } from '@metad/core'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxSingleSelectionTableComponent } from './single-selection-table/single-selection-table.component'

/**
 * @deprecated use NgmTableComponent
 */
@NgModule({
  declarations: [NxSingleSelectionTableComponent],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatInputModule,
    NxCoreModule,
    TranslateModule,

    //OCAP Modules
    OcapCoreModule,
    NgmSearchComponent
  ],
  exports: [NxSingleSelectionTableComponent]
})
export class NxTableModule {}
