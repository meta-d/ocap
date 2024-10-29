import { Component, computed, effect, inject, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { DisplayBehaviour, isEqual } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CdkMenuModule } from '@angular/cdk/menu'
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'
import { NgmDensityDirective } from '@metad/ocap-angular/core'
import { MatInputModule } from '@angular/material/input'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { TXpertParameter, XpertParameterTypeEnum } from '../../../@core'
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor'


@Component({
  standalone: true,
  selector: 'xpert-parameters-edit',
  templateUrl: './parameters.component.html',
  styleUrl: 'parameters.component.scss',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CdkMenuModule,
    CdkListboxModule,
    DragDropModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatInputModule,

    NgmDensityDirective,
    NgmSelectComponent
  ],

  hostDirectives: [NgxControlValueAccessor],
})
export class XpertParametersEditComponent {

  eXpertParameterTypeEnum = XpertParameterTypeEnum
  eDisplayBehaviour = DisplayBehaviour

  protected cva = inject<NgxControlValueAccessor<Partial<TXpertParameter[]> | null>>(NgxControlValueAccessor)
  readonly #fb = inject(FormBuilder)

  readonly form = this.#fb.group({
    parameters: this.#fb.array([])
  })

  get parameters() {
    return this.form.get('parameters') as FormArray
  }


  constructor() {
    effect(() => {
      const value = this.cva.value$()
      if (value && !this.parameters.value.length) {
        this.initParameters(value)
      }
    }, { allowSignalWrites: true })
  }

  onChange() {
    this.cva.writeValue(this.parameters.value)
  }

  initParameters(values: TXpertParameter[]) {
    this.parameters.clear()
    values?.forEach((p) => {
      this.addParameter(p)
    })
  }

  addParameter(param: Partial<TXpertParameter>) {
    this.parameters.push(
      this.#fb.group({
        type: this.#fb.control(param.type),
        name: this.#fb.control(param.name),
        title: this.#fb.control(param.title),
        description: this.#fb.control(param.description),
        optional: this.#fb.control(param.optional),
        maximum: this.#fb.control(param.maximum),
        options: this.#fb.control(param.options),
      })
    )
    this.onChange()
  }
  
  updateParameter(index: number, name: string, value: string) {
    this.parameters.at(index).get(name).setValue(value, {emitEvent: true})
    this.form.markAsDirty()
    this.onChange()
  }

  deleteParameter(i: number) {
    this.parameters.removeAt(i)
    this.onChange()
  }

  addOption(index: number) {
    const control = this.parameters.at(index)
    control.patchValue({
      options: [
        ...(control.value.options ?? []),
        ''
      ]
    })
    this.onChange()
  }

  setOption(index: number, j: number, value: string) {
    const control = this.parameters.at(index)
    control.value.options[j] = value
    control.patchValue({
      options: control.value.options
    })
    this.onChange()
  }

  deleteOption(index: number, j: number) {
    const control = this.parameters.at(index)
    control.value.options.splice(j)
    control.patchValue({
      options: control.value.options
    })
    this.onChange()
  }

  drop(index: number, event: CdkDragDrop<string, string>) {
    const control = this.parameters.at(index)
    moveItemInArray(control.value.options, event.previousIndex, event.currentIndex)
    control.patchValue({
      options: control.value.options
    })
    this.onChange()
  }
}
