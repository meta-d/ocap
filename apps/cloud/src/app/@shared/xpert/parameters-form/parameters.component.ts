import { CommonModule } from '@angular/common'
import { Component, computed, inject, input } from '@angular/core'
import { NgmSelectComponent, SlashSvgComponent, VariableSvgComponent } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor'
import { TXpertParameter, XpertParameterTypeEnum } from '../../../@core'
import { FormsModule } from '@angular/forms'

@Component({
  standalone: true,
  selector: 'xpert-parameters-form',
  templateUrl: './parameters.component.html',
  styleUrl: 'parameters.component.scss',
  imports: [CommonModule, FormsModule, TranslateModule, NgmSelectComponent, VariableSvgComponent, SlashSvgComponent],
  hostDirectives: [NgxControlValueAccessor]
})
export class XpertParametersFormComponent {
  eXpertParameterTypeEnum = XpertParameterTypeEnum
  eDisplayBehaviour = DisplayBehaviour

  protected cva = inject<NgxControlValueAccessor<Partial<Record<string, unknown>> | null>>(NgxControlValueAccessor)

  readonly parameters = input<TXpertParameter[]>()

  readonly params = computed(() => {
    return this.parameters().map((parameter) => {
      if (parameter.type === XpertParameterTypeEnum.SELECT) {
        return {
          ...parameter,
          options: parameter.options.map((key) => ({
            key,
            caption: key
          }))
        }
      }
      return parameter as any
    })
  })

  getParameter(name: string) {
    return this.cva.value?.[name]
  }

  updateParameter(name: string, value: unknown) {
    this.cva.writeValue({
      ...(this.cva.value ?? {}),
      [name]: value
    })
  }
}