import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { AggregationRole, DataSettings, getPropertyName, getPropertyTextName } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { isNil } from 'lodash'
import { map, shareReplay, tap } from 'rxjs/operators'
import { NgmAnalyticsBusinessService } from './analytics.service'

export interface AnalyticalGridOptions {
  showToolbar?: boolean
  displayDensity?: DisplayDensity
  strip?: boolean
  paging?: boolean
  pageSize?: number
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-analytical-grid',
  templateUrl: 'analytical-grid.component.html',
  styleUrls: ['analytical-grid.component.scss'],
  host: { class: 'ngm-analytical-grid' },
  providers: [NgmAnalyticsBusinessService]
})
export class AnalyticalGridComponent implements OnInit, OnChanges, AfterViewInit {
  AggregationRole = AggregationRole

  @Input() title: string
  @Input() displayDensity: DisplayDensity | string
  @Input() dataSettings: DataSettings
  @Input() options: AnalyticalGridOptions

  @ViewChild(MatPaginator)
  set paginator(v: MatPaginator) {
    this.dataSource.paginator = v
  }
  @ViewChild(MatSort) sort: MatSort

  dataSource = new MatTableDataSource<unknown>()

  public readonly isLoading$ = this.analyticsService.loading$ //.pipe(map(() => true))
  public readonly error$ = this.analyticsService.selectResult().pipe(map((result) => result.error))

  public readonly columns$ = this.analyticsService.analytics$.pipe(
    map((analytics) => {
      return [...(analytics?.rows ?? []), ...(analytics?.columns ?? [])]
        .filter((column) => !isNil(column?.property))
        .map((column: any) => {
          column.label = column.label || (getPropertyTextName(column.property) ?? column.property?.name)
          // column.name = getPropertyTextName(column.property) ?? column.property?.name
          return column
        })
    }),
    tap((data) => console.log(data)),
    shareReplay(1)
  )

  public readonly displayedColumns$ = this.columns$.pipe(
    map((columns) => columns?.map((column) => getPropertyName(column)))
  )

  constructor(public analyticsService: NgmAnalyticsBusinessService<unknown>) {}

  ngOnInit() {
    this.analyticsService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.refresh()
      })
    this.columns$.subscribe((columns) => console.warn(columns))

    this.analyticsService
      .selectResult()
      .pipe(
        map((result) => result.results),
        tap((data) => console.log(data)),
        untilDestroyed(this)
      )
      .subscribe((data) => (this.dataSource.data = data))
  }

  ngOnChanges({ dataSettings }: SimpleChanges) {
    if (dataSettings?.currentValue) {
      this.analyticsService.dataSettings = dataSettings.currentValue
      // this.refresh()
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort
  }

  refresh() {
    this.analyticsService.refresh()
  }

  @HostBinding('class.striped')
  get _isStriped() {
    return this.options?.strip
  }
}
