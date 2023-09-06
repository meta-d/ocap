import { Injectable } from '@angular/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { isNumber, PeriodFunctions, SmartIndicatorDataService } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { combineLatest, map } from 'rxjs'
import { Trend } from '../types'

@UntilDestroy()
@Injectable()
export class IndicatorItemDataService extends SmartIndicatorDataService<unknown> {

  constructor(dsCoreService: NgmDSCoreService) {
    super(dsCoreService)
  }

  override selectQuery() {
    const lookBack = this.get((state) => state.lookBack)

    return combineLatest([
      super.selectQuery(null, null, [PeriodFunctions.CURRENT, PeriodFunctions.MOM, PeriodFunctions.YOY, PeriodFunctions.YTD], 0),
      super.selectQuery(null, null, [PeriodFunctions.CURRENT], lookBack ?? 1)
    ]).pipe(
      map(([current, trends]) => {
        if (current.error || trends.error) {
          return {
            indicator: this.indicator,
            error: `${(current.error ?? '').trim()}\n${(trends.error ?? '').trim()}`.trim()
          }
        }
        const items = trends.data?.filter((item) => isNumber((item as any).CURRENT))
        const start = (items[0] as any)?.CURRENT
        const end = (items[items.length - 1] as any)?.CURRENT
        return {
          indicator: this.indicator,
          trends: trends.data,
          data: current.data?.[0] as unknown[],
          trend: start > end ? Trend.Down : start < end ? Trend.Up : Trend.None
        }
      }),
    )
  }
}
