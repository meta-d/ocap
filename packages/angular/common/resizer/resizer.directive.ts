import { CdkDrag } from '@angular/cdk/drag-drop'
import {
  AfterViewInit,
  ChangeDetectorRef,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core'

@Directive({
  selector: '[ngmResizerBar]',
})
export class ResizerBarDirective {
  private readonly el = inject(ElementRef)
  public readonly cdkDrag = inject(CdkDrag)
  private readonly resizer = inject(ResizerDirective)

  @Input('resizerBarPosition') position: 'top' | 'right' | 'bottom' | 'left'
  width = 3
  @HostBinding('class.ngm-resizer-bar') _isResizerBarDirective = true

  ngOnInit(): void {
    if (this.position) {
      this.el.nativeElement.style.position = 'absolute'
      switch (this.position) {
        case 'top':
          this.el.nativeElement.style.left = 0
          this.el.nativeElement.style.top = 0
          this.el.nativeElement.style.width = '100%'
          this.el.nativeElement.style.height = this.width + 'px'
          this.el.nativeElement.style.cursor = 'row-resize'
          break
        case 'right':
          this.el.nativeElement.style.top = 0
          this.el.nativeElement.style.right = 0
          this.el.nativeElement.style.height = '100%'
          this.el.nativeElement.style.width = this.width + 'px'
          this.el.nativeElement.style.cursor = 'col-resize'
          break
        case 'bottom':
          this.el.nativeElement.style.left = 0
          this.el.nativeElement.style.bottom = 0
          this.el.nativeElement.style.width = '100%'
          this.el.nativeElement.style.height = this.width + 'px'
          this.el.nativeElement.style.cursor = 'row-resize'
          break
        case 'left':
          this.el.nativeElement.style.top = 0
          this.el.nativeElement.style.left = 0
          this.el.nativeElement.style.height = '100%'
          this.el.nativeElement.style.width = this.width + 'px'
          this.el.nativeElement.style.cursor = 'col-resize'
          break
      }
    }
  }
}

@Directive({
  selector: '[ngmResizer]'
})
export class ResizerDirective implements OnInit, AfterViewInit {
  @HostBinding('style.width.px')
  @Input('resizerWidth')
  width: number

  @HostBinding('style.height.px')
  @Input('resizerHeight')
  height: number

  @HostBinding('class.ngm-resizer-disabled')
  @Input() ngmResizerDisabled = false

  @Output('resizerWidthChange') widthChange = new EventEmitter<number>()
  @Output('resizerHeightChange') heightChange = new EventEmitter<number>()

  @ContentChild(ResizerBarDirective)
  public resizerBar!: ResizerBarDirective
  @ContentChildren(ResizerBarDirective)
  public resizerBars!: ResizerBarDirective[]

  _width: number
  _height: number
  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._width = this.width
    this._height = this.height
    this.el.nativeElement.style.overflow = 'visible'
  }

  ngAfterViewInit(): void {
    this.resizerBars.forEach((resizerBar) => {
      resizerBar.cdkDrag.started.subscribe((event) => {
        this._width = this.width
        this._height = this.height
      })
      resizerBar.cdkDrag.moved.subscribe((event) => {
        switch (resizerBar.position) {
          case 'left':
            this.width = Number(this._width) - event.distance.x
            this.widthChange.emit(this.width)
            break
          case 'top':
            this.height = Number(this._height)  - event.distance.y
            this.heightChange.emit(this.height)
            break
          case 'right':
            this.width = Number(this._width) + event.distance.x
            this.widthChange.emit(this.width)
            break
          case 'bottom':
            this.height = Number(this._height) + event.distance.y
            this.heightChange.emit(this.height)
            break
        }
        resizerBar.cdkDrag.reset()
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      })
      resizerBar.cdkDrag.ended.subscribe((event) => {
        resizerBar.cdkDrag.reset()
        event.source.element.nativeElement.style.transform = ''
      })
    })
  }
}
