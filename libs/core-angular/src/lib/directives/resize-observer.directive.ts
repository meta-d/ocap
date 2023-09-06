import { Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core'
import { debounce, interval, Subject } from 'rxjs'
// import ResizeObserver from 'resize-observer-polyfill'; //not needed really since > Chrome 64

const entriesMap = new WeakMap()

const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entriesMap.has(entry.target)) {
      const comp = entriesMap.get(entry.target)
      comp._resizeCallback(entry)
    }
  }
})

@Directive({
  standalone: true,
  selector: '[resizeObserver]'
})
export class ResizeObserverDirective implements OnDestroy {
  @Input('resizeDebounceTime') debounceTime = 0

  @Output() sizeChange = new EventEmitter()

  private resize$ = new Subject()

  private _subscriber = this.resize$.pipe(debounce(() => interval(this.debounceTime))).subscribe((event) => {
    this.sizeChange.emit(event)
  })

  constructor(private el: ElementRef) {
    const target = this.el.nativeElement
    entriesMap.set(target, this)
    ro.observe(target)
  }

  _resizeCallback(entry) {
    this.resize$.next(entry)
  }

  ngOnDestroy() {
    const target = this.el.nativeElement
    ro.unobserve(target)
    entriesMap.delete(target)
    this._subscriber.unsubscribe()
  }
}
