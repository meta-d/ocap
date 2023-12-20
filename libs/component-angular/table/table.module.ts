import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NxCoreModule } from '@metad/core'
import { NxSingleSelectionTableComponent } from './single-selection-table/single-selection-table.component'
import { MyCustomPaginatorIntl, NxTableComponent } from './table/table.component'
import { MatInputModule } from '@angular/material/input'

/**
 * @deprecated use NgmTableComponent
 */
@NgModule({
  declarations: [NxSingleSelectionTableComponent, NxTableComponent],
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
  exports: [NxSingleSelectionTableComponent, NxTableComponent]
})
export class NxTableModule {
  static forRoot(): ModuleWithProviders<NxTableModule> {
    return {
      ngModule: NxTableModule,
      providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }]
    }
  }
}
