import { DragDropModule } from '@angular/cdk/drag-drop'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatTreeModule } from '@angular/material/tree'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { EntitySchemaComponent } from './entity-schema/entity-schema.component'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    ScrollingModule,
    TranslateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgmCommonModule,
    OcapCoreModule
  ],
  exports: [EntitySchemaComponent],
  declarations: [EntitySchemaComponent],
  providers: []
})
export class EntityModule {}
