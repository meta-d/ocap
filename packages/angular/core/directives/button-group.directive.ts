import { Directive, ElementRef } from '@angular/core'

@Directive({
  standalone: true,
  selector: '[ngmButtonGroup]',
  host: {
    class: 'ngm-button-group'
  }
})
export class ButtonGroupDirective {
  constructor(private elementRef: ElementRef) {}
}
