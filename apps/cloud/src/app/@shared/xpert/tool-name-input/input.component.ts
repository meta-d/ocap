import { CommonModule } from '@angular/common'
import { Component, computed, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor'
import { TranslateModule } from '@ngx-translate/core'
import { TOOL_NAME_REGEX } from '../../../@core'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, TranslateModule],
  selector: 'xpert-tool-name-input',
  templateUrl: 'input.component.html',
  styleUrls: ['input.component.scss'],
  hostDirectives: [NgxControlValueAccessor]
})
export class XpertToolNameInputComponent {
  protected cva = inject<NgxControlValueAccessor<string | null>>(NgxControlValueAccessor)

  readonly model = this.cva.value$

  readonly nameError = computed(() => {
    const name = this.model()
    const isValidName = TOOL_NAME_REGEX.test(name)
    return !name || !isValidName
  })
}
