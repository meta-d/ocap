import { Directive, ElementRef, HostBinding, booleanAttribute, computed, inject, input, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { resizeObservable } from '../helpers'

@Directive({
  standalone: true,
  selector: '[ngmTransformScale]'
})
export class NgmTransformScaleDirective {
  private host = inject(ElementRef)

  readonly width = input<number | string>()
  readonly height = input<number | string>()

  readonly targetWidth = input<number | string>()
  readonly targetHeight = input<number | string>()

  readonly disabled = input<boolean, string | boolean>(false, {
    alias: 'ngmTransformDisabled',
    transform: booleanAttribute
  })

  readonly _width = signal<number>(null)
  readonly _height = signal<number>(null)
  readonly _targetWidth = signal<number>(null)
  readonly _targetHeight = signal<number>(null)

  readonly hostWidth = computed(() => this._width() ?? this.width())
  readonly hostHeight = computed(() => this._height() ?? this.height())
  readonly hostTargetWidth = computed(() => this._targetWidth() ?? this.targetWidth())
  readonly hostTargetHeight = computed(() => this._targetHeight() ?? this.targetHeight())

  @HostBinding('style.transform')
  get scale() {
    return this.disabled()
      ? null
      : `scale(${Math.min(
          Number(this.hostTargetWidth()) / Number(this.hostWidth()),
          Number(this.hostTargetHeight()) / Number(this.hostHeight())
        )}`
  }

  @HostBinding('style.transform-origin')
  get transformOrigin() {
    return this.disabled() ? null : 'top left'
  }

  // shift to center
  @HostBinding('style.margin-left.px')
  get marginLeft() {
    return this.disabled()
      ? null
      : Number(this.hostTargetHeight()) / Number(this.hostHeight()) <
        Number(this.hostTargetWidth()) / Number(this.hostWidth())
      ? (Number(this.hostTargetWidth()) -
          (Number(this.hostTargetHeight()) / Number(this.hostHeight())) * Number(this.hostWidth())) /
        2
      : 0
  }

  // Shift to middle
  @HostBinding('style.margin-top.px')
  get marginTop() {
    return this.disabled()
      ? null
      : Number(this.hostTargetWidth()) / Number(this.hostWidth()) <
        Number(this.hostTargetHeight()) / Number(this.hostHeight())
      ? (Number(this.hostTargetHeight()) -
          (Number(this.hostTargetWidth()) / Number(this.hostWidth())) * Number(this.hostHeight())) /
        2
      : 0
  }

  observer: ResizeObserver
  parentObserver: ResizeObserver

  constructor() {
    resizeObservable(this.host.nativeElement)
      .pipe(
        // debounceTime(1000),
        takeUntilDestroyed()
      )
      .subscribe((entries) => {
        this._width.set(entries[0].contentRect.width)
        this._height.set(entries[0].contentRect.height)
      })

    resizeObservable(this.host.nativeElement.parentElement)
      .pipe(
        // debounceTime(1000),
        takeUntilDestroyed()
      )
      .subscribe((entries) => {
        this._targetWidth.set(entries[0].contentRect.width)
        this._targetHeight.set(entries[0].contentRect.height)
      })
  }
}
