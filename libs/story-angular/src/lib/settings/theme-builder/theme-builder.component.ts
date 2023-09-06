import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MonacoEditorModule } from 'ngx-monaco-editor'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TranslateModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MonacoEditorModule,
    ButtonGroupDirective
  ],
  selector: 'nx-theme-builder',
  templateUrl: './theme-builder.component.html',
  styleUrls: ['./theme-builder.component.scss']
})
export class ThemeBuilderComponent {

  public readonly data = inject(MAT_DIALOG_DATA)

  c_light = 'light'
  c_dark = 'dark'
  c_thin = 'thin'

  activeLink = 'light'

  editorOptions = { theme: 'vs', language: 'json' }
  statement = ''
  themes = {}
  error = ''

  ngOnInit() {
    this.themes = {...this.data}
    
    this.onActive(this.activeLink)
  }
  
  onActive(link: string) {
    this.activeLink = link
    if (this.themes[link]) {
      try {
        this.statement = JSON.stringify(this.themes[link])
      } catch (err) {
        this.statement = ''
      }
    } else {
      this.statement = ''
    }
  }

  onStatementChange(result: string) {
    this.error = ''
    if (result.trim()) {
      try {
        this.themes[this.activeLink] = JSON.parse(result)
      } catch (err: any) {
        this.error = err.message
      }
    } else {
      this.themes[this.activeLink] = null
    }
  }
}
