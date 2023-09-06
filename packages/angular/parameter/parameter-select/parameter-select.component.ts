import { CommonModule } from '@angular/common'
import { Component, forwardRef, inject, Input, ViewContainerRef } from '@angular/core'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { DataSettings, EntityType, ParameterControlEnum, parameterFormatter } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NxCoreService } from '@metad/core'
import { BehaviorSubject, combineLatest, firstValueFrom, map, startWith } from 'rxjs'
import { NgmParameterCreateComponent } from '../parameter-create/parameter-create.component'
import { DragDropModule } from '@angular/cdk/drag-drop'


@Component({
  standalone: true,
  selector: 'ngm-parameter-select',
  templateUrl: 'parameter-select.component.html',
  styleUrls: ['parameter-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmParameterSelectComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatDividerModule,
    MatAutocompleteModule,
    TranslateModule,
    OcapCoreModule
  ]
})
export class NgmParameterSelectComponent implements ControlValueAccessor {
  ParameterControlEnum = ParameterControlEnum

  private readonly _dialog = inject(MatDialog)
  public readonly viewContainerRef = inject(ViewContainerRef)

  @Input() appearance: MatFormFieldAppearance = 'fill'
  @Input() label = 'Parameter'
  @Input() placeholder = '@'

  @Input() dataSettings: DataSettings
  @Input() coreService: NxCoreService
  @Input() get entityType(): EntityType {
    return this.entityType$.value
  }
  set entityType(value) {
    this.entityType$.next(value)
  }
  private entityType$ = new BehaviorSubject<EntityType>(null)

  @Input() disabled: boolean

  formControl = new FormControl()

  public readonly parameters$ = this.entityType$.pipe(
    map((entityType) => {
      return Object.keys(entityType?.parameters ?? {}).map((key) => ({
        value: parameterFormatter(key),
        label: entityType.parameters[key].caption || key
      }))
    })
  )
  public selectOptions$ = combineLatest([this.parameters$, this.formControl.valueChanges.pipe(startWith(null))]).pipe(
    map(([parameters, value]) =>
      parameters.filter((p) => (value ? p.value.toLowerCase().includes(value.toLowerCase()) : true))
    )
  )

  get value() {
    return this.formControl.value
  }
  set value(value) {
    this.formControl.setValue(value)
    this.onChange?.(value)
  }

  private onChange: any
  private onTouched: any

  writeValue(obj: any): void {
    this.formControl.setValue(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  onOptionSelected(event) {
    //
  }

  async openCreate() {
    await firstValueFrom(
      this._dialog
        .open(NgmParameterCreateComponent, {
          viewContainerRef: this.viewContainerRef,
          data: {
            dataSettings: this.dataSettings,
            coreService: this.coreService,
            entityType: this.entityType
          }
        })
        .afterClosed()
    )
  }
}
