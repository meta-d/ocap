import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { ConfirmCodeEditorComponent } from './confirm-code-editor/confirm-code-editor.component'
import { BaseEditorDirective } from './editor.directive'
import { MDXMemberEditorComponent } from './mdx-member/mdx-member.component'
import { MDXEditorComponent } from './mdx/mdx.component'
import { SchemaEditorComponent } from './schema/schema.component'
import { SqlMemberComponent } from './sql-member/sql-member.component'
import { SQLEditorComponent } from './sql/sql.component'

/**
 * @deprecated use @metad/ocap-angular/editor
 */
@NgModule({
  declarations: [
    SchemaEditorComponent,
    MDXEditorComponent,
    SQLEditorComponent,
    MDXMemberEditorComponent,
    SqlMemberComponent,
    BaseEditorDirective,
    ConfirmCodeEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MonacoEditorModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,

    ButtonGroupDirective
  ],
  exports: [
    SchemaEditorComponent,
    MDXEditorComponent,
    MDXMemberEditorComponent,
    ConfirmCodeEditorComponent,
    SqlMemberComponent,
    SQLEditorComponent
  ]
})
export class NxEditorModule {}
