import { ChangeDetectorRef, Component, forwardRef, OnDestroy } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { isNotEqual } from '@metad/core'
import { BaseEditorDirective } from '../editor.directive'


@Component({
  selector: 'nx-editor-schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss'],
  host: {
    class: 'nx-editor-schema',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SchemaEditorComponent),
    },
  ],
})
export class SchemaEditorComponent extends BaseEditorDirective implements ControlValueAccessor, OnDestroy {
  // // CodeEditor options
  // @Input() get options() {
  //   return this._options$.value
  // }
  // set options(value) {
  //   this._options$.next(value)
  // }
  // private _options$ = new BehaviorSubject({})
  // // CodeEditor
  // get editor() {
  //   return this.editor$.value
  // }
  // private editor$ = new BehaviorSubject<editor.ICodeEditor>(null)

  // private defaultOptions = {
  //   theme: 'vs',
  //   language: languageId,
  //   automaticLayout: true,
  // }
  // public editorOptions$ = this._options$.pipe(
  //   map((options) => assign({}, this.defaultOptions, options))
  // )

  languageId = 'json'
  private origin: any
  // statement: string = ''
  constructor(private _cdr: ChangeDetectorRef) {
    super()
  }

  onChange(event) {
    try {
      const model = JSON.parse(event)
      if (isNotEqual(model, this.origin)) {
        this._onChange?.(model)
      }
    } catch (err) {
      // console.error(err)
    }
  }

  writeValue(obj: any): void {
    this.origin = obj
    this.code = obj ? JSON.stringify(obj, null, '\t') : null
    this._cdr.detectChanges()

    // 没起作用
    // setTimeout(() => {
    //   this.editor?.getAction('editor.action.formatDocument').run().then(() => console.log('format finished'))
    // })
    
  }
  // registerOnChange(fn: any): void {
  //   this._onChange = fn
  // }
  // registerOnTouched(fn: any): void {}
  // setDisabledState?(isDisabled: boolean): void {}

  // onInit(editor: any) {
  //   this.editor$.next(editor)
  // }

  // onResized(event) {
  //   this.editor?.layout()
  // }

  // dispose() {
  //   this._providers.forEach((provider) => provider.dispose())
  // }

  // ngOnDestroy(): void {
  //   this.dispose()
  // }
}
