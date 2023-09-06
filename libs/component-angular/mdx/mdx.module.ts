import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'
import { NxEntityModule } from '@metad/components/entity'
import { NxActionStripModule } from '@metad/components/action-strip'

@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    MatTreeModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatExpansionModule,
    MatInputModule,
    MatToolbarModule,
    MatListModule,
    NxEntityModule,
    NxActionStripModule
  ],
  exports: [ ],
})
export class PACMDXModule {}
