import { CommonModule } from '@angular/common'
import { Component, Input, forwardRef, inject } from '@angular/core'
import { ControlValueAccessor, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { chartSettingsFieldGroup, getChartOptionsSchema } from '../analytical-card.schema'
import { ChartType, cloneDeep, isEqual } from '@metad/ocap-core'
import { AccordionWrappers } from '@metad/story/designer'
import { toSignal } from '@angular/core/rxjs-interop'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { BehaviorSubject, combineLatest } from 'rxjs'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, FormlyModule],
  selector: 'ngm-chart-settings',
  templateUrl: 'chart-settings.component.html',
  styleUrls: ['chart-settings.component.scss'],
  host: {
    class: 'ngm-chart-settings'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmChartSettingsComponent)
    }
  ]
})
export class NgmChartSettingsComponent implements ControlValueAccessor {
  private readonly translateService = inject(TranslateService)

  @Input()
  get chartType() {
    return this.chartType$.value
  }
  set chartType(value) {
    this.chartType$.next(value)
  }
  private chartType$ = new BehaviorSubject<ChartType>(null)
  
  formGroup = new FormGroup({})

  fields = toSignal(combineLatest([
    this.chartType$.pipe(distinctUntilChanged(isEqual)),
    this.translateService.stream('Story')
  ]).pipe(
    map(([chartType, i18nStory]) => {
      return [
        ...AccordionWrappers([
          {
            key: 'chartSettings',
            label: i18nStory?.Widgets?.CHART?.ChartSettings ?? 'Chart Settings',
            toggleable: false,
            fieldGroup: chartSettingsFieldGroup(i18nStory?.Widgets)
          }
        ]),
    
        getChartOptionsSchema(chartType, i18nStory?.STYLING?.ECHARTS)
      ]
    }))
  )

  model = {}
  options = {}

  onChange: (input: any) => void
  onTouched: () => void

  writeValue(obj: any): void {
    if (obj) {
      console.log('writeValue', obj)
      this.formGroup.patchValue(obj)
      this.model = cloneDeep(obj)
      // assign(this.model, cloneDeep(obj))
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formGroup.disable() : this.formGroup.enable()
  }
  onModelChange(event) {
    this.onChange(event)
  }
}
