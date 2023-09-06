import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core'

@Directive({
  standalone: true,
  selector: '[ngmTransformScale]'
})
export class NgmTransformScaleDirective implements OnInit, OnDestroy {
  private host = inject(ElementRef)
  private cdr = inject(ChangeDetectorRef)

  // @HostBinding('style.width.px')
  @Input()
  width: number | string
  // @HostBinding('style.height.px')
  @Input()
  height: number | string

  @Input() targetWidth: number | string
  @Input() targetHeight: number | string

  @Input({alias: 'ngmTransformDisabled', transform: (value: string | boolean) => coerceBooleanProperty(value)})
  disabled = false

  @HostBinding('style.transform')
  get scale() {
    return this.disabled ? null : `scale(${Math.min(
      Number(this.targetWidth) / Number(this.width),
      Number(this.targetHeight) / Number(this.height)
    )}`
  }

  @HostBinding('style.transform-origin')
  get transformOrigin() {
    return this.disabled ? null : 'top left'
  }

  // shift to center
  @HostBinding('style.margin-left.px')
  get marginLeft() {
    return this.disabled ? null : Number(this.targetHeight) / Number(this.height) < Number(this.targetWidth) / Number(this.width)
    ? (Number(this.targetWidth) - (Number(this.targetHeight) / Number(this.height)) * Number(this.width)) / 2 : 0
  }

  // Shift to middle
  @HostBinding('style.margin-top.px')
  get marginTop() {
    return this.disabled ? null : Number(this.targetWidth) / Number(this.width) < Number(this.targetHeight) / Number(this.height)
    ? (Number(this.targetHeight) - (Number(this.targetWidth) / Number(this.width)) * Number(this.height)) / 2 : 0
  }

  observer: ResizeObserver
  parentObserver: ResizeObserver

  ngOnInit() {
    this.observer = new ResizeObserver((entries) => {
      this.width = entries[0].contentRect.width
      this.height = entries[0].contentRect.height
      this.cdr.markForCheck()
    })

    this.observer.observe(this.host.nativeElement)

    this.parentObserver = new ResizeObserver((entries) => {
      this.targetWidth = entries[0].contentRect.width
      this.targetHeight = entries[0].contentRect.height
      this.cdr.markForCheck()
    })

    this.parentObserver.observe(this.host.nativeElement.parentElement)
  }

  ngOnDestroy() {
    this.observer.unobserve(this.host.nativeElement)
    this.parentObserver.unobserve(this.host.nativeElement)
  }
}
