import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { TranslateModule } from '@ngx-translate/core'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { SlicerSelectComponent } from './select/select.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    OcapCoreModule
  ],
  exports: [SlicerSelectComponent],
  declarations: [SlicerSelectComponent],
  providers: []
})
export class SlicersModule {}
