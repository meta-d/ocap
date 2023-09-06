import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { NxMicroTableComponent } from './micro-table/micro-table.component'

@NgModule({
  declarations: [NxMicroTableComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
  ],
  exports: [NxMicroTableComponent]
})
export class NxSmartMicroModule {}
