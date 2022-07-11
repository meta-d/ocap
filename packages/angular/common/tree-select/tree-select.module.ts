import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatTreeModule } from '@angular/material/tree'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { DisplayBehaviourModule } from '../display-behaviour/display-behaviour.module'
import { TreeSelectComponent } from './tree-select.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    ScrollingModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatChipsModule,
    MatTreeModule,
    TranslateModule,

    OcapCoreModule,
    DisplayBehaviourModule
  ],
  exports: [TreeSelectComponent],
  declarations: [TreeSelectComponent],
  providers: []
})
export class TreeSelectModule {}
