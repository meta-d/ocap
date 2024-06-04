import { Directive } from '@angular/core'

@Directive({
  standalone: true,
  selector: '[ngmButtonGroup]',
  host: {
    class: 'ngm-button-group'
  }
})
export class ButtonGroupDirective {}
