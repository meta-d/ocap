import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs'
import { NxChartLibrary } from '../smart-chart/types'

@Injectable()
export class NxChartService {
  protected theme$ = new ReplaySubject<string>(1)
  protected refresh$ = new Subject<void>()
  protected resize$ = new Subject<void>()

  public chartLibrary$ = new BehaviorSubject<{ lib: NxChartLibrary; registerTheme: (name, theme) => void }>(
    null
  )

  // 在 chart 实例上做动作
  public doAction$ = new Subject<any>()
  public chartOptions$ = new Subject<any>()

  /**
   * 重新计算图形大小
   */
  resize() {
    this.resize$.next()
  }

  onResize(): Observable<void> {
    return this.resize$.asObservable()
  }

  /**
   * On chart theme change event
   */
  onThemeChange() {
    return this.theme$.asObservable()
  }

  /**
   * Trigger the chart theme change event
   *
   * @param theme The name of EChart theme
   */
  changeTheme(theme) {
    this.theme$.next(theme)
  }

  /**
   * On chart refresh event
   */
  onRefresh(): Observable<void> {
    return this.refresh$.asObservable()
  }

  /**
   * Refresh chart
   */
  refresh(): void {
    this.refresh$.next()
  }
}
