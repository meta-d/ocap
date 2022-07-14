import { FocusMonitor } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Directive, ElementRef, HostBinding, Input } from '@angular/core'
import { CanColor, mixinColor } from '@angular/material/core'

export type ngmAppearance = 'filled' | 'outline' | 'ghost' | 'hero' | 'acrylic' | 'opacity' | 'dashed' | 'danger'

const _NgmAppearanceBase = mixinColor(
  class {
    constructor(public _elementRef: ElementRef) {}
  }
)

@Directive({
  selector: '[ngmAppearance]',
  inputs: ['color'],
})
export class AppearanceDirective extends _NgmAppearanceBase implements CanColor {
  @Input() ngmAppearance: ngmAppearance = 'filled'

  /**
   * Sets `outline` appearance
   */
  @Input()
  @HostBinding('class.ngm-appearance-outline')
  get outline(): boolean {
    return this.ngmAppearance === 'outline'
  }
  set outline(value: boolean) {
    if (coerceBooleanProperty(value)) {
      this.ngmAppearance = 'outline'
    }
  }

  @Input()
  @HostBinding('class.ngm-appearance-acrylic')
  get acrylic(): boolean {
    return this.ngmAppearance === 'acrylic'
  }
  set acrylic(value: boolean) {
    if (coerceBooleanProperty(value)) {
      this.ngmAppearance = 'acrylic'
    }
  }

  @Input()
  @HostBinding('class.ngm-appearance-opacity')
  get opacity(): boolean {
    return this.ngmAppearance === 'opacity'
  }
  set opacity(value: boolean) {
    if (coerceBooleanProperty(value)) {
      this.ngmAppearance = 'opacity'
    }
  }

  @Input()
  @HostBinding('class.ngm-appearance-dashed')
  get dashed(): boolean {
    return this.ngmAppearance === 'dashed'
  }
  set dashed(value: any) {
    if (coerceBooleanProperty(value)) {
      this.ngmAppearance = 'dashed'
    }
  }

  @Input()
  @HostBinding('class.ngm-appearance-danger')
  get danger(): boolean {
    return this.ngmAppearance === 'danger'
  }
  set danger(value: any) {
    if (coerceBooleanProperty(value)) {
      this.ngmAppearance = 'danger'
    }
  }

  constructor(elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
    super(elementRef)
  }
}
