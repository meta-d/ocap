import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { SlicerSelectComponent } from './select/select.component'
import { NgmSlicerPipe } from './slicer/slicer.pipe'
import { SortByComponent } from './sort-by/sort-by.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    OcapCoreModule,
    NgmSlicerPipe
  ],
  exports: [SlicerSelectComponent, SortByComponent, NgmSlicerPipe],
  declarations: [SlicerSelectComponent, SortByComponent],
  providers: []
})
export class SlicersModule {}
