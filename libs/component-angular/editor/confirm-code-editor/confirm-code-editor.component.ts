import { Component, HostBinding, Inject, effect, inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ThemeService } from '@metad/core'
import { isBlank } from '@metad/ocap-core'
import { BehaviorSubject } from 'rxjs'
import { EditorThemeMap } from '../types'

export interface ConfirmCodeEditorData {
  language?: string
  model: any
  onApply?: (model: any) => void
}

@Component({
  selector: 'ngm-confirm-code-editor',
  templateUrl: './confirm-code-editor.component.html',
  styleUrls: ['./confirm-code-editor.component.scss']
})
export class ConfirmCodeEditorComponent {
  readonly themeService = inject(ThemeService)

  @HostBinding('class.ngm-dialog-container') isDialogContainer = true

  public editor$ = new BehaviorSubject(null)
  editorOptions = {
    theme: 'vs',
    language: 'json',
    automaticLayout: true
  }

  statement: string = ''
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmCodeEditorData,
    public dialogRef?: MatDialogRef<ConfirmCodeEditorComponent>
  ) {
    effect(() => {
      this.editorOptions = {
        ...this.editorOptions,
        theme: EditorThemeMap[this.themeService.themeClass()]
      }
    })

    this.editorOptions = {
      ...this.editorOptions,
      language: this.data?.language ?? this.editorOptions.language,
    }

    this.onReset()
  }

  onReset() {
    this.statement =
      this.editorOptions.language === 'json' ? JSON.stringify(this.data.model || undefined, null, 2) : this.data.model
  }

  onClear() {
    this.statement = null
  }

  onApply() {
    this.data?.onApply?.(this.parse())
  }

  onOk() {
    this.dialogRef.close(this.parse())
  }

  parse() {
    return this.editorOptions.language === 'json' ? parse(this.statement) : this.statement
  }
}

/**
 * 转换 JSON 格式
 */
function parse(value: string) {
  return isBlank(value) ? null : JSON.parse(value)
}
