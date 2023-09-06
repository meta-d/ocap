import { FocusableOption, FocusMonitor } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Directive, ElementRef, HostBinding, Input } from '@angular/core'
import { CanColor, mixinColor } from '@angular/material/core'
import { Subject } from 'rxjs'

export type ngmAppearance = 'filled' | 'outline' | 'ghost' | 'hero' | 'acrylic' | 'opacity' | 'color' | 'dashed' | 'danger'

const _NgmAppearanceBase = mixinColor(
  class {
    constructor(public _elementRef: ElementRef) {}
  }
)

@Directive({
  standalone: true,
  selector: '[ngmAppearance]',
  inputs: ['color'],
  host: {
    '(focus)': 'focus()'
  }
})
export class AppearanceDirective extends _NgmAppearanceBase implements CanColor, FocusableOption {
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

  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<any>();

  disabled?: boolean
  /** Whether the chip has focus. */
  _hasFocus = false;
  constructor(elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
    super(elementRef)
  }
  
  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    if (!this._hasFocus) {
      this._elementRef.nativeElement.focus();
      this._onFocus.next({chip: this});
    }
    this._hasFocus = true;
  }

  getLabel?(): string {
    throw new Error('Method not implemented.')
  }
}
