import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { compact, isNil } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { AbstractStoryWidget, DEFAULT_DIGITS_INFO, nonNullable } from '@metad/core'
import { Observable, distinctUntilChanged, filter, map } from 'rxjs'
import { AccountingStatementDataService } from './accounting-statement-data.service'
import { AccountingStatementOptions, ArrowDirection, IndicatorOption } from './types'

interface IndicatorData extends IndicatorOption {
  data: unknown
}

@UntilDestroy({ checkProperties: true })
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-widget-accounting-statement',
  templateUrl: './accounting-statement.component.html',
  styleUrls: ['accounting-statement.component.scss'],
  providers: [AccountingStatementDataService],
  host: {
    class: 'pac-widget-accounting-statement'
  }
})
export class AccountingStatementComponent extends AbstractStoryWidget<AccountingStatementOptions> implements OnInit {
  ArrowDirection = ArrowDirection
  IsNil = isNil

  public readonly dataService = inject(AccountingStatementDataService)

  public readonly placeholder$ = this.dataSettings$.pipe(
    map((dataSettings) => !(dataSettings?.dataSource && dataSettings?.entitySet))
  )

  public readonly columnConfig$ = this.options$.pipe(
    map((options) => {
      const hasGroup = !!options?.indicators?.find((item) => item.groupName)
      const displayedColumns = []
      if (hasGroup) {
        displayedColumns.push('_group_')
      }
      displayedColumns.push('_name_')
      const columns = options?.measures
        ?.filter((item) => !!item)
        .map((item) => ({
          ...item,
          digitsInfo: item.digitsInfo || this.options.digitsInfo || DEFAULT_DIGITS_INFO
        }))
      if (columns) {
        displayedColumns.push(...columns.map((item) => item.name))
      }
      return {
        hasGroup: !!options?.indicators?.find((item) => item.groupName),
        columns,
        displayedColumns
      }
    })
  )

  public readonly tableData$: Observable<Array<IndicatorData>> = this.dataService.selectResult().pipe(
    map(({ data }) => {
      return data
        ?.filter(({ error, data }) => !error && data?.length)
        .map(({ data: item, stats }, index) => {
          const option = this.options.indicators[index]
          return {
            ...option,
            name: option.name || stats.indicator.name,
            data: item[0]
          }
        })
    })
  )

  public readonly isLoading$ = this.dataService.loading$
  public readonly error$ = this.dataService
    .selectResult()
    .pipe(map(({ data }) => compact(data?.map(({ error }) => error))?.join('\n')))
  public readonly entityType$ = this.dataService.selectEntityType()

  ngOnInit() {
    this.dataService
      .selectResult()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        this.setExplains(result.data)
      })
    this.dataSettings$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe((value) => {
      this.dataService.dataSettings = value
    })
    this.options$.pipe(filter(nonNullable), distinctUntilChanged(), untilDestroyed(this)).subscribe((options) => {
      this.dataService.patchState({
        options: options,
        indicatorId: options.indicators?.[0]?.id
      })
    })

    this.dataService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.refresh()
      })

    // 订阅来自 `WidgetService` 的刷新事件进行刷新数据
    this.widgetService
      ?.onRefresh()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.refresh()
      })
  }

  /**
   * 重写父类 `AbstractStoryWidget` 的 `refresh` 实现来自 StoryWidget 调用的刷新方法
   */
  override refresh(force = false) {
    this.dataService.refresh(force)
  }

  trackByChip(index, chip) {
    return chip.text
  }
}
