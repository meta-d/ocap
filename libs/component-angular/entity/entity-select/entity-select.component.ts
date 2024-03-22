import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling'
import { Component, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { MatSelect } from '@angular/material/select'
import { DisplayBehaviour } from '@metad/ocap-core'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { map, startWith, switchMap, tap } from 'rxjs/operators'

/**
 * @deprecated
 */
@Component({
  selector: 'ngm-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.scss'],
  host: {
    'class': 'ngm-entity-select'
  }
})
export class EntitySelectComponent implements OnInit {

  DISPLAY_BEHAVIOUR = DisplayBehaviour.descriptionAndId
  appearance: MatFormFieldAppearance = 'fill'
  searchControl = new UntypedFormControl()
  fControl      = new UntypedFormControl()
  get highlight() {
    return this.searchControl.value
  }

  @ViewChild(CdkVirtualScrollViewport, { static: false })
  cdkVirtualScrollViewPort: CdkVirtualScrollViewport

  @ViewChild(MatSelect, { static: true }) matSelect: MatSelect

  get searchable() {
    return true
  }

  private _selectedOption$ = new BehaviorSubject<Array<any>>([])
  readonly options$ = this._selectedOption$.pipe(
    switchMap((options) =>
      this.searchControl.valueChanges.pipe(
        startWith(''),
        map((text) => {
          if (text?.trim()) {
            return options.filter((option) =>
              `${option.label || ''}${option.value}`.includes(text.trim())
            )
          }
          return options
        }),
        tap(() => {
          this.cdkVirtualScrollViewPort?.scrollToIndex(0)
        })
      )
    )
  )
  selectedOption$: Observable<any>
    
  ngOnInit() {
    // this.appearance = this.to.appearance || this.appearance

    this.selectedOption$ = combineLatest([
      this.fControl.valueChanges.pipe(startWith(this.fControl.value)),
      this.options$
    ]).pipe(
      map(([value, options]) => {
        const index = options.findIndex(item => item.value === value)
        this.cdkVirtualScrollViewPort?.scrollToIndex(index)
        this.cdkVirtualScrollViewPort?.checkViewportSize()
        return options[index]
      })
    )
  }

  ngAfterViewInit() {
    // if (this.to?.options instanceof Observable) {
    //   this.to.options.subscribe(event => this._selectedOption$.next(event))
    // } else if(this.to?.options) {
    //   this._selectedOption$.next(this.to.options)
    // }
  }

  openChange($event: boolean) {
    if ($event) {
      this.cdkVirtualScrollViewPort.scrollToIndex(0)
      this.cdkVirtualScrollViewPort.checkViewportSize()
    } else {
    }
  }

}
