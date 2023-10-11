import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { PACFormlyChartTypeComponent } from './chart-type.component'
import { NgxPopperjsModule } from 'ngx-popperjs'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { NgmCommonModule, ResizerModule } from '@metad/ocap-angular/common'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmDesignerFormComponent } from '@metad/story/designer'
import { MatButtonToggleModule } from '@angular/material/button-toggle'

@NgModule({
  declarations: [PACFormlyChartTypeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MonacoEditorModule,
    TranslateModule,
    ButtonGroupDirective,
    DensityDirective,
    NgmCommonModule,
    ResizerModule,
    NgxPopperjsModule,
    NgmDesignerFormComponent,
    
    FormlyModule.forChild({
      types: [
        {
          name: 'chart-type',
          component: PACFormlyChartTypeComponent
        }
      ]
    })
  ],
  exports: [PACFormlyChartTypeComponent]
})
export class PACFormlyChartTypeModule {}
