import { Component, forwardRef, Input, OnInit } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { DataSettings, EntityType } from '@metad/ocap-core'
import { NxCoreService } from '@metad/core'
import { assign } from 'lodash-es'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'nx-calculation-sql',
  templateUrl: './calculation-sql.component.html',
  styleUrls: ['./calculation-sql.component.scss'],
  host: {
    class: 'nx-calculation-sql',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CalculationSqlComponent),
    },
  ],
})
export class CalculationSqlComponent implements ControlValueAccessor, OnInit {
  @Input() dataSettings: DataSettings
  @Input()
  get entityType(): EntityType {
    return this.entityType$.value
  }
  set entityType(value) {
    this.entityType$.next(value)
  }
  private entityType$ = new BehaviorSubject<EntityType>(null)
  @Input() coreService: NxCoreService

  @Input() get options() {
    return this._options$.value
  }
  set options(value) {
    this._options$.next(value)
  }
  private _options$ = new BehaviorSubject({})

  editor: any
  private defaultOptions = {
    theme: 'vs',
    language: 'sql',
    automaticLayout: true,
  }
  public editorOptions$ = this._options$.pipe(
    map((options) => assign({}, this.defaultOptions, options))
  )

  statement: string = ''

  private _providers = []
  private _onChange: any
  constructor() {}

  ngOnInit(): void {}

  writeValue(obj: any): void {
    this.statement = obj
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  onInit(editor: any) {
    this.editor = editor
  }

  onModelChange(event) {
    this._onChange?.(this.statement)
  }

  onResized(event) {
    this.editor?.layout()
  }
}
