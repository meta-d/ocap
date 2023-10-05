import { CommonModule } from '@angular/common'
import { Component, Input, forwardRef, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { ChartType } from '@metad/ocap-core'
import { NgmDesignerFormComponent, NxDesignerModule, STORY_DESIGNER_SCHEMA } from '@metad/story/designer'
import { TranslateModule } from '@ngx-translate/core'
import { MeasureChartOptionsSchemaService } from '../analytical-card.schema'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,

    NxDesignerModule,
    NgmDesignerFormComponent
  ],
  selector: 'ngm-chart-measure-form',
  template: `<ngm-designer-form class="w-full" [formControl]="formControl"></ngm-designer-form>`,
  styles: [
    `
      :host {
        padding: 0;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmChartMeasureComponent)
    },
    {
      provide: STORY_DESIGNER_SCHEMA,
      useClass: MeasureChartOptionsSchemaService
    }
  ]
})
export class NgmChartMeasureComponent implements ControlValueAccessor {
  private readonly schema = inject<MeasureChartOptionsSchemaService>(STORY_DESIGNER_SCHEMA)

  @Input() get chartType(): ChartType {
    return this.schema.chartType
  }
  set chartType(value: ChartType) {
    this.schema.chartType = value
  }

  formControl = new FormControl({})

  private valueSub = this.formControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
    this.onChange?.(value)
  })

  onChange: (input: any) => void
  onTouched: () => void

  writeValue(obj: any): void {
    if (obj) {
      this.formControl.patchValue(obj)
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }
}
