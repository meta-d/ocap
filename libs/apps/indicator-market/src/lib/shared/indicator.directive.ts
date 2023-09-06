import { ChangeDetectorRef, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { PeriodFunctions, SmartIndicatorDataService } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { IndicatorState } from '../types'

@UntilDestroy()
@Directive({
  selector: '[pacIndicator]',
  exportAs: 'pacIndicator',
  providers: [SmartIndicatorDataService]
})
export class PACIndicatorDirective implements OnInit, OnChanges {
  @Input() indicator: IndicatorState

  data = {} as any
  constructor(private dataService: SmartIndicatorDataService<unknown>, private _cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.dataService
      .selectResult()
      .pipe(untilDestroyed(this))
      .subscribe(({ data }) => {
        this.data = {
          current: data[0]?.['CURRENT'],
          ytd: data[0]?.['YTD'],
          yoy: data[0]?.['YOY'],
          mom: data[0]?.['MOM'],
          ytdom: data[0]?.['YTDOM'],
          ytdoy: data[0]?.['YTDOY']
        }
        this._cdr.detectChanges()
      })

    this.dataService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.dataService.refresh()
      })
  }

  ngOnChanges({ indicator }: SimpleChanges): void {
    if (indicator?.currentValue) {
      this.dataService.dataSettings = {
        dataSource: indicator.currentValue.dataSourceName,
        entitySet: indicator.currentValue.entity
      }

      this.dataService.patchState({
        indicatorId: indicator.currentValue.id,
        measures: [
          PeriodFunctions.CURRENT,
          PeriodFunctions.YTD,
          PeriodFunctions.YOY,
          PeriodFunctions.MOM,
          PeriodFunctions.YTDOY,
          PeriodFunctions.YTDOM
        ]
      })
    }
  }
}
