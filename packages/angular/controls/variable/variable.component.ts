import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, model } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { DataSettings, ISlicer, VariableProperty } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NgmSmartFilterService } from '../smart-filter.service'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-variable',
  templateUrl: 'variable.component.html',
  styleUrls: ['variable.component.scss'],
  host: {
    class: 'ngm-variable'
  },
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmVariableComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    OcapCoreModule,
    NgmCommonModule
  ]
})
export class NgmVariableComponent implements ControlValueAccessor {
  private smartFilterService = inject(NgmSmartFilterService)

  readonly label = input<string>()

  readonly dataSettings = input<DataSettings>(null)
  readonly variable = input<VariableProperty>()

  readonly selectOptions$ = this.smartFilterService.selectOptions$

  readonly value = model<string>()

  private slicer: ISlicer = null

  private _onChange: any
  private onTouched: any
  readonly disabled = model<boolean>(false)

  private refreshSub = this.smartFilterService
    .onAfterServiceInit()
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.smartFilterService.refresh()
    })

  constructor() {
    effect(
      () => {
        this.smartFilterService.dataSettings = this.dataSettings()
      },
      { allowSignalWrites: true }
    )

    effect(
      () => {
        if (this.variable()) {
          this.smartFilterService.options = {
            dimension: {
              dimension: this.variable().referenceDimension,
              hierarchy: this.variable().referenceHierarchy
            }
          }
        }
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      const value = this.value()
      const variable = this.variable()
      // 初始化完成后便可以发出值或空值
      if (this.slicer && variable) {
        this._onChange?.(value
            ? {
                ...this.slicer,
                dimension: {
                  dimension: variable.referenceDimension,
                  hierarchy: variable.referenceHierarchy
                },
                members: [
                  {
                    key: value
                  }
                ]
              }
            : null
        )
      }
    })
  }

  clear() {
    this.value.set(null)
  }

  writeValue(obj: any): void {
    if (obj) {
      this.value.set(obj.members[0]?.key)
      this.slicer = obj
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled)
  }
}
