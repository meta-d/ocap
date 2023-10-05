// import {
//   ChangeDetectorRef,
//   Directive,
//   ElementRef,
//   EventEmitter,
//   HostBinding,
//   Inject,
//   Input,
//   LOCALE_ID,
//   Optional,
//   Output,
//   Type
// } from '@angular/core'
// import { ComponentStore } from '@ngrx/component-store'
// import { isArray, isNil, isString } from 'lodash-es'
// import { NGXLogger } from 'ngx-logger'
// import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs'
// import { debounce, distinctUntilChanged, filter, map, pluck, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'
// import { NxCoreService } from '../services/core.service'
// import { Canvas, NX_SMART_CHART_TYPE, SmartChartTypeProvider } from './chart'
// import { NxSmartChartEngine, NxSmartChartEngineOptions, NxSmartChartEngineSettings } from './smart-chart-engine'
// import { NxChartLibrary, NxIChartClickEvent } from './types'

// export interface SmartChartState {
//   chartType: ChartType
//   theme: string
//   chartAnnotation: NxChartAnnotation
//   entityType: EntityType
//   data: QueryReturn<unknown> //Array<any>
//   chartSettings: NxSmartChartEngineSettings
//   chartOptions: NxSmartChartEngineOptions
// }

// /**
//  * 抽象层的 chart 组件
//  * @todo 1. 是否要支持不提供 entityType 即可画图?
//  */
// @Directive()
// // tslint:disable-next-line: directive-class-suffix
// export abstract class NxSmartChartComponent<T extends NxSmartChartEngine = NxSmartChartEngine> extends ComponentStore<SmartChartState> {
//   public abstract readonly chartLibrary: NxChartLibrary

//   @Input()
//   get chartType() {
//     return this.get((state) => state.chartType)
//   }
//   set chartType(value) {
//     this.patchState({ chartType: value })
//   }
//   protected chartType$ = this.select((state) => state.chartType).pipe(filter(value => !!value))

//   @Input()
//   get theme() {
//     return this.get((state) => state.theme)
//   }
//   set theme(value) {
//     if (value) {
//       this.patchState({ theme: value })
//     }
//   }
//   protected theme$ = this.select((state) => state.theme)

//   @Input()
//   get chartAnnotation() {
//     return this.get((state) => state.chartAnnotation)
//   }
//   set chartAnnotation(value) {
//     this.patchState({ chartAnnotation: value })
//   }
//   protected chartAnnotation$ = this.select((state) => state.chartAnnotation)

//   @Input()
//   get data() {
//     return this.get((state) => state.data)
//   }
//   set data(value) {
//     this.patchState({ data: value })
//   }
//   protected data$ = this.select((state) => state.data)

//   @Input()
//   get entityType() {
//     return this.get((state) => state.entityType)
//   }
//   set entityType(value) {
//     this.patchState({ entityType: value })
//   }
//   protected entityType$ = this.select((state) => state.entityType)

//   @Input()
//   get chartSettings() {
//     return this.get((state) => state.chartSettings)
//   }
//   set chartSettings(value) {
//     this.patchState({ chartSettings: value })
//   }
//   protected chartSettings$ = this.select((state) => state.chartSettings)

//   @Input()
//   get chartOptions() {
//     return this.get((state) => state.chartOptions)
//   }
//   set chartOptions(value) {
//     this.patchState({ chartOptions: value })
//   }
//   protected chartOptions$ = this.select((state) => state.chartOptions)

//   @Output() internalError = new EventEmitter()
//   @Output() chartClick: EventEmitter<NxIChartClickEvent> | Observable<NxIChartClickEvent>
//   @Output() chartContextMenu = new EventEmitter<NxIChartClickEvent>()
//   @Output() filterChange = new EventEmitter<ISlicer>()

//   // 内部状态
//   get chartEngine(): T {
//     return this._chartEngine$.getValue()
//   }
//   set chartEngine(value: T) {
//     this._chartEngine$.next(value)
//   }
//   protected _chartEngine$ = new BehaviorSubject<T>(null)
//   public readonly chartEngine$ = this._chartEngine$.pipe(filter(engine => !!engine))

//   protected _canvas$ = new BehaviorSubject<Canvas>(null)

//   public options$ // = new BehaviorSubject<any>(null)

//   // protected currentOffsetWidth = 0
//   // protected currentOffsetHeight = 0
//   // private currentWindowWidth: number
//   // private currentWindowHeight: number
//   constructor(
//     public coreService: NxCoreService,
//     private elRef: ElementRef,
//     protected cdr: ChangeDetectorRef,
//     @Inject(LOCALE_ID) public locale: string,
//     @Inject(NX_SMART_CHART_TYPE)
//     @Optional()
//     protected smartChartTypes?: Array<SmartChartTypeProvider>,
//     // @Inject(NX_SCALE_CHROMATIC)
//     // @Optional()
//     // protected scaleChromaticService?: NxIScaleChromatic,
//     @Optional()
//     protected _logger?: NGXLogger
//   ) {
//     super({ chartType: null, theme: 'default' } as SmartChartState)

//     this.options$ = this.chartEngine$.pipe(
//       // 每个新的 chartEngine 切换其 internalError 的订阅 ( filter 函数使 internalError 的事件不影响后续操作, startWith 发送 chartEngine 对象给后续操作 )
//       switchMap((chartEngine: T) =>
//         chartEngine.internalError.pipe(
//           tap((err) => this.internalError.emit(err)),
//           filter(() => false),
//           startWith(chartEngine)
//         )
//       ),
//       // 每个新的 chartEngine 切换其 chartOptions 的订阅
//       switchMap((chartEngine) => chartEngine.onChartOptions()),
//       // // 深度对比结果是否有变化
//       // distinctUntilChanged((a, b) => isEqual(a, b)),
//       shareReplay(1)
//     )

//     // chartEngine: 以 chartType 为主变化时需重新创建 chartEngine
//     this.chartType$
//       .pipe(
//         pluck('type'),
//         distinctUntilChanged(),
//         debounce(() => interval(100)),
//         map((chartType) => {
//           this._logger?.debug('chartType:', chartType, '有变化需要重建 chartEngine')
//           this.chartEngine?.onDestroy()
//           const chartEngine = this.createChartEngine<T>(chartType)
//           // this.scaleChromaticService?.setChromatics(chartEngine.getPaletteChromatics())
//           return chartEngine
//         })
//       )
//       .subscribe(this._chartEngine$)

//     // 对于 @Input 的输入参数要进行简单的引用变化判断 (distinctUntilChanged), 避免不必要的刷新
//     combineLatest([
//       this._chartEngine$.pipe(tap(() => this._logger?.debug('chartEngine changed'))),
//       this.entityType$,
//       this.chartAnnotation$.pipe(filter((v) => !!v)),
//       this.data$.pipe(filter((d) => !isNil(d))),
//       this.chartSettings$,
//       this.chartOptions$,
//       this._canvas$
//     ])
//       // .pipe(
//       //   // 防抖动: 时间阈值要晚于 chartEngine 处理链
//       //   debounce(() => interval(100))
//       // )
//       .subscribe(([chartEngine, entityType, chartAnnotation, data, chartSettings, chartOptions, canvas]) => {
//         if (chartEngine) {
//           chartEngine.entityType = entityType
//           chartEngine.chartAnnotation = chartAnnotation
//           chartEngine.data = data
//           chartEngine.settings = chartSettings
//           chartEngine.chartOptions = chartOptions
//           chartEngine.canvas = canvas
//         }
//         this.cdr.detectChanges()
//       })
//   }

//   // ngDoCheck() {
//   //   const offsetWidth = this.elRef.nativeElement.offsetWidth
//   //   const offsetHeight = this.elRef.nativeElement.offsetHeight
//   //   if (this.currentOffsetWidth !== offsetWidth || this.currentOffsetHeight !== offsetHeight) {
//   //     this.currentOffsetWidth = offsetWidth
//   //     this.currentOffsetHeight = offsetHeight
//   //     // 暂时取消组件尺寸大小变化事件
//   //     // this._canvas$.next({
//   //     //   width: this.currentOffsetWidth,
//   //     //   height: this.currentOffsetHeight
//   //     // })
//   //   }
//   // }

//   createChartEngine<T extends NxSmartChartEngine>(chartType: string | Type<T>): T {
//     let customChartType: T
//     if (isString(chartType)) {
//       if (this.smartChartTypes) {
//         const smartChartTypeProvider = (
//           isArray(this.smartChartTypes) ? this.smartChartTypes : [this.smartChartTypes]
//         ).find((provider: SmartChartTypeProvider) => {
//           return provider.chartLib === this.chartLibrary && provider.chartType === chartType
//         })

//         if (smartChartTypeProvider) {
//           customChartType = new smartChartTypeProvider.smartChartType(
//             this.entityType,
//             this.coreService,
//             this.locale,
//             this._logger
//           ) as unknown as T
//         } else {
//           throw new Error(`Cant find Smart Chart Type Provider for chart type "${chartType}"`)
//         }
//       } else {
//         throw new Error(`You sould inject Smart Chart Type providers`)
//       }
//     } else {
//       customChartType = new chartType(this.entityType, this.coreService, this.locale, this._logger) as T
//     }

//     return customChartType
//   }

//   abstract resize()

//   @HostBinding('class.ngm-smart-chart')
//   get isSmartChart() {
//     return true
//   }
// }
