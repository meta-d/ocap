import { CommonModule } from '@angular/common'
import { Component, computed, ElementRef, forwardRef, inject, Input, signal, ViewContainerRef } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { CanColor, CanDisable, mixinColor, mixinDisabled, mixinDisableRipple } from '@angular/material/core'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { NgmSelectModule } from '@metad/ocap-angular/common'
import { DensityDirective, NgmDSCoreService } from '@metad/ocap-angular/core'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import {
  CalculationProperty,
  DataSettings,
  getEntityMeasures,
  getEntityProperty,
  isCalculationProperty,
  isEntitySet,
  isIndicatorMeasureProperty
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { nonNullable, NxCoreService } from '@metad/core'
import { distinctUntilChanged, filter, firstValueFrom, map, switchMap } from 'rxjs'
import { CalculationEditorComponent } from '../calculation'
import { orderBy } from 'lodash-es'
import { MatTooltipModule } from '@angular/material/tooltip'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgmSelectModule,
    NgmEntityPropertyComponent,
    DensityDirective
  ],
  selector: 'ngm-measure-select',
  templateUrl: './measure-select.component.html',
  styles: [],
  inputs: ['color', 'disabled'],
  host: {
    class: 'ngm-measure-select'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmMeasureSelectComponent)
    }
  ]
})
export class NgmMeasureSelectComponent
  extends mixinColor(
    mixinDisabled(
      mixinDisableRipple(
        class {
          constructor(public _elementRef: ElementRef) {}
        }
      )
    )
  )
  implements ControlValueAccessor, CanDisable, CanColor
{
  private readonly dsCoreService = inject(NgmDSCoreService)
  private readonly coreService = inject(NxCoreService)
  private readonly _dialog = inject(MatDialog)
  private readonly _viewContainerRef = inject(ViewContainerRef)

  @Input() label: string
  @Input() placeholder: string
  @Input() get dataSettings(): DataSettings {
    return this._dataSettings()
  }
  set dataSettings(value: DataSettings) {
    this._dataSettings.set(value)
  }
  private readonly _dataSettings = signal<DataSettings>(null)

  formControl = new FormControl<string>(null)

  private readonly value = toSignal(this.formControl.valueChanges)
  private readonly entityType = toSignal(
    toObservable(this._dataSettings).pipe(
      filter(nonNullable),
      switchMap(({ dataSource, entitySet }) => this.dsCoreService.selectEntitySet(dataSource, entitySet)),
      filter(isEntitySet),
      map(({ entityType }) => entityType)
    )
  )

  public readonly measureOptions = computed(() => {
    const measures = this.entityType()
      ? getEntityMeasures(this.entityType())
      : []

    return [
      {
        name: null,
        caption: '',
      },
      ...orderBy(measures.filter((measure) => !isCalculationProperty(measure)), ['name']),
      ...orderBy(measures.filter((measure) => isCalculationProperty(measure) && !isIndicatorMeasureProperty(measure)), ['calculationType', 'name']),
      ...orderBy(measures.filter((measure) => isIndicatorMeasureProperty(measure)), ['name'])
    ].map((measure) => ({
      key: measure.name,
      caption: measure.caption,
      value: measure
    }))
  })
  private readonly syntax = computed(() => this.entityType()?.syntax)

  private readonly property = computed(() => {
    return getEntityProperty(this.entityType(), this.value())
  })
  public readonly isCalculationProperty = computed(() => {
    return isCalculationProperty(this.property()) && !isIndicatorMeasureProperty(this.property())
  })

  onChange: (input: any) => void
  onTouched: () => void
  // Subscribers
  private _formValueSub = this.formControl.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
    this.onChange?.(value)
  })

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
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }

  async openCalculationMeasure() {
    const data = {
      dataSettings: this.dataSettings,
      entityType: this.entityType(),
      syntax: this.syntax,
      coreService: this.coreService,
      dsCoreService: this.dsCoreService,
      value: null
    }

    const property = await firstValueFrom(
      this._dialog
        .open<CalculationEditorComponent, unknown, CalculationProperty>(CalculationEditorComponent, {
          viewContainerRef: this._viewContainerRef,
          data
        })
        .afterClosed()
    )
    if (property) {
      // 发送给 DSCoreService 存储到元信息增强里
      // this.coreService.storyUpdateEvent$.next({
      //   type: 'Calculation',
      //   dataSettings: this.dataSettings,
      //   property
      // })
      this.dsCoreService.updateStory({
        type: 'Calculation',
        dataSettings: this.dataSettings,
        property
      })
      // 然后将新计算度量名称赋值给当前控件
      this.formControl.setValue(property.name)
    }
  }

  async editCalculationMeasure() {
    const data = {
      dataSettings: this.dataSettings,
      entityType: this.entityType(),
      syntax: this.syntax,
      coreService: this.coreService,
      dsCoreService: this.dsCoreService,
      value: this.property()
    }

    const property = await firstValueFrom(
      this._dialog
        .open<CalculationEditorComponent, unknown, CalculationProperty>(CalculationEditorComponent, {
          viewContainerRef: this._viewContainerRef,
          data
        })
        .afterClosed()
    )
    if (property) {
      // 发送给 DSCoreService 存储到元信息增强里
      // this.coreService.storyUpdateEvent$.next({
      //   type: 'Calculation',
      //   dataSettings: this.dataSettings,
      //   property
      // })
      this.dsCoreService.updateStory({
        type: 'Calculation',
        dataSettings: this.dataSettings,
        property
      })
      // 然后将新计算度量名称赋值给当前控件
      this.formControl.setValue(property.name)
    }
  }
}
