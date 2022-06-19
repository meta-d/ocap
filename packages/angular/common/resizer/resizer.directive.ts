import { CdkDrag } from '@angular/cdk/drag-drop'
import {
  AfterViewInit,
  ChangeDetectorRef,
  ContentChild,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnInit
} from '@angular/core'

@Directive({
  selector: '[ngmResizerBar]'
})
export class ResizerBarDirective {
  @Input('resizerBarPosition') position: 'top' | 'right' | 'bottom' | 'left'
  width = 3
  @HostBinding('class.ngm-resizer-bar') _isResizerBarDirective = true
  constructor(private el: ElementRef, public cdkDrag: CdkDrag) {}

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

  @ContentChild(ResizerBarDirective)
  public resizerBar!: ResizerBarDirective

  _width: number
  _height: number
  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._width = this.width
    this._height = this.height
    this.el.nativeElement.style.overflow = 'visible'
  }

  ngAfterViewInit(): void {
    this.resizerBar.cdkDrag.started.subscribe((event) => {
      this._width = this.width
      this._height = this.height
    })
    this.resizerBar.cdkDrag.moved.subscribe((event) => {
      switch (this.resizerBar.position) {
        case 'left':
          this.width = this._width - event.distance.x
          break
        case 'top':
          this.height = this._height - event.distance.y
          break
        case 'right':
          this.width = this._width + event.distance.x
          break
        case 'bottom':
          this.height = this._height + event.distance.y
          break
      }
      this.resizerBar.cdkDrag.reset()
      this.cdr.markForCheck()
      this.cdr.detectChanges()
    })
    this.resizerBar.cdkDrag.ended.subscribe((event) => {
      this.resizerBar.cdkDrag.reset()
      event.source.element.nativeElement.style.transform = ''
    })
  }
}
