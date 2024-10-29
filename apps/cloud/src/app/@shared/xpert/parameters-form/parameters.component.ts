import { Component, computed, input } from '@angular/core'
import { IXpert, TXpertParameter, XpertParameterTypeEnum } from '../../../@core'
import { CommonModule } from '@angular/common'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'


@Component({
  standalone: true,
  selector: 'xpert-parameters-form',
  templateUrl: './parameters.component.html',
  styleUrl: 'parameters.component.scss',
  imports: [
    CommonModule,
    TranslateModule,
    NgmSelectComponent
  ]
})
export class XpertParametersFormComponent {

    eXpertParameterTypeEnum = XpertParameterTypeEnum
    eDisplayBehaviour = DisplayBehaviour

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

}
