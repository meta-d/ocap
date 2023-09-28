import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CommonModule } from '@angular/common'
import { Component, Input, computed, forwardRef, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { NgmColorsComponent } from '@metad/components/form-field'
import {
  NgmChromaticInterpolateGroup,
  NxChromaticPreviewComponent,
  getScaleChromaticInterpolates
} from '@metad/components/palette'
import { PropertyCapacity, PropertyModule } from '@metad/components/property'
import { NxCoreService } from '@metad/core'
import { DensityDirective, NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  AggregationRole,
  CalculationProperty,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartPattern,
  ChartType,
  DataSettings,
  EntityType,
  getEntityProperty,
  isEqual,
  pick
} from '@metad/ocap-core'
import { NgmDesignerFormComponent, NxDesignerModule, NxSettingsPanelService, STORY_DESIGNER_SCHEMA } from '@metad/story/designer'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { startCase } from 'lodash-es'
import { BehaviorSubject, Subscription, distinctUntilChanged, firstValueFrom, from, map } from 'rxjs'
import { DimensionChartOptionsSchemaService } from '../analytical-card.schema'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatCheckboxModule,
    TranslateModule,

    PropertyModule,
    NxDesignerModule,
    NxChromaticPreviewComponent,
    DensityDirective,
    NgmColorsComponent,
    NgmDesignerFormComponent
  ],
  selector: 'ngm-chart-property',
  templateUrl: 'chart-property.component.html',
  styleUrls: ['chart-property.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmChartPropertyComponent)
    },
    {
      provide: STORY_DESIGNER_SCHEMA,
      useClass: DimensionChartOptionsSchemaService
    },
  ]
})
export class NgmChartPropertyComponent implements ControlValueAccessor {
  public coreService = inject(NxCoreService)
  public dsCoreService = inject(NgmDSCoreService)
  public settingsService? = inject(NxSettingsPanelService, { optional: true })
  public translateService = inject(TranslateService)

  @Input() appearance: MatFormFieldAppearance = 'fill'
  @Input() capacities: PropertyCapacity[]
  @Input() get removable() {
    return this._removable()
  }
  set removable(value: string | boolean) {
    this._removable.set(coerceBooleanProperty(value))
  }
  private readonly _removable = signal(false)

  @Input() get dataSettings(): DataSettings {
    return this._dataSettings()
  }
  set dataSettings(value) {
    this._dataSettings.set(value)
  }
  private readonly _dataSettings = signal<DataSettings>(null)

  @Input() get entityType(): EntityType {
    return this._entityType()
  }
  set entityType(value) {
    this._entityType.set(value)
  }
  private readonly _entityType = signal<EntityType>(null)

  public interpolateGroups: NgmChromaticInterpolateGroup[]

  DIMENSION_ROLES = [
    { label: 'None', value: null },
    { label: 'Category', value: ChartDimensionRoleType.Category },
    { label: 'Category2', value: ChartDimensionRoleType.Category2 },
    { label: 'Group', value: ChartDimensionRoleType.Group },
    { label: 'Stacked', value: ChartDimensionRoleType.Stacked },
    // { label: 'Color', value: ChartDimensionRoleType.Color }, 应该是还未支持
    { label: 'Trellis', value: ChartDimensionRoleType.Trellis }
  ]

  MEASURE_ROLES = [
    { label: 'None', value: null },
    { label: 'Axis1', value: ChartMeasureRoleType.Axis1 },
    { label: 'Axis2', value: ChartMeasureRoleType.Axis2 },
    { label: 'Axis3', value: ChartMeasureRoleType.Axis3 },
    { label: 'Size', value: ChartMeasureRoleType.Size },
    { label: 'Lightness', value: ChartMeasureRoleType.Lightness },
    { label: 'SizeLightness', value: ChartMeasureRoleType.SizeLightness },
    { label: 'Tooltip', value: ChartMeasureRoleType.Tooltip }
  ]

  PATTERNS = [
    { label: 'A', value: ChartPattern.a },
    { label: 'B', value: ChartPattern.b },
    { label: 'C', value: ChartPattern.c },
    { label: 'D', value: ChartPattern.d },
    { label: 'E', value: ChartPattern.e },
    { label: 'F', value: ChartPattern.f },
    { label: 'G', value: ChartPattern.g },
    { label: 'H', value: ChartPattern.h }
  ]

  SHAPE_TYPES = [
    { label: 'Bar', value: 'bar', icon: 'stacked_bar_chart' },
    { label: 'Line', value: 'line', icon: 'show_chart' },
    { label: 'Scatter', value: 'scatter', icon: 'scatter_plot' }
  ]

  /**
   * 对接 ngm-property-select 的 FormControl, 与当前组件的 formControl 连接
   */
  formControl = new FormControl()

  get showMeasureStyle() {
    return this.capacities?.includes(PropertyCapacity.MeasureStyle)
  }
  get showColorPalette() {
    return this.capacities?.includes(PropertyCapacity.MeasureStylePalette)
  }
  get showMeasurePalettePattern() {
    return this.capacities?.includes(PropertyCapacity.MeasureStylePalettePattern)
  }
  get showChartAttributes() {
    return this.capacities?.includes(PropertyCapacity.DimensionChart)
  }
  get showMeasureRole() {
    return this.capacities?.includes(PropertyCapacity.MeasureStyleRole)
  }
  get showMeasureShape() {
    return this.capacities?.includes(PropertyCapacity.MeasureStyleShape)
  }
  get showMeasureGridBar() {
    return this.capacities?.includes(PropertyCapacity.MeasureStyleGridBar)
  }
  get showMeasureReferenceLine() {
    return this.capacities?.includes(PropertyCapacity.MeasureStyleReferenceLine)
  }
  get showMeasureChartOptions() {
    return this.capacities?.includes(PropertyCapacity.MeasureStyleChartOptions)
  }

  public readonly syntax = computed(() => this.entityType?.syntax)
  public readonly restrictedDimensions$ = new BehaviorSubject<string[]>(null)

  get role() {
    return this.formControl.value?.role
  }
  set role(value) {
    this.patchValue({ role: value })
  }

  get palette() {
    return this.formControl.value?.palette?.name
  }
  set palette(value) {
    let interpolate = null
    this.interpolateGroups.find((group) =>
      group.values.find((item) => {
        if (item.name === value) {
          interpolate = item
        }
        return item.name === value
      })
    )

    this.patchValue({
      palette: {
        ...(this.formControl.value?.palette || {}),
        name: value,
        colors: interpolate?.colors?.map(({ fill }) => fill)
      }
    })
  }

  get colors() {
    return this.formControl.value?.palette?.colors
  }
  set colors(value) {
    this.patchValue({
      palette: {
        ...(this.formControl.value?.palette || {}),
        colors: value
      }
    })
  }

  get reverse() {
    return this.formControl.value?.palette?.reverse
  }
  set reverse(value) {
    this.patchValue({
      palette: {
        ...(this.formControl.value?.palette || {}),
        reverse: value
      }
    })
  }

  get pattern() {
    return this.formControl.value?.palette?.pattern
  }
  set pattern(value) {
    this.patchValue({
      palette: {
        ...(this.formControl.value?.palette || {}),
        pattern: value
      }
    })
  }

  get shapeType() {
    return this.formControl.value?.shapeType
  }
  set shapeType(value) {
    this.patchValue({ shapeType: value })
  }
  get bar() {
    return this.formControl.value?.bar
  }
  set bar(value) {
    this.patchValue({ bar: value })
  }

  get chartOptions() {
    return this.formControl.value?.chartOptions
  }
  set chartOptions(value) {
    this.patchValue({ chartOptions: value })
  }

  public readonly dimension = toSignal(
    this.formControl.valueChanges.pipe(
      map((value) => pick(value, 'dimension', 'hierarchy', 'level', 'measure')),
      distinctUntilChanged(isEqual)
    )
  )

  public readonly property = computed(() => getEntityProperty(this.entityType, this.dimension()))

  public readonly isDimension = computed(() => {
    return this.property()?.role === AggregationRole.dimension
  })
  public readonly isMeasure = computed(() => {
    return this.property()?.role === AggregationRole.measure
  })

  private chartOptionsSubscription: Subscription
  private referenceLineSubscription: Subscription
  private editAttributesSubscription: Subscription

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private colorsSub = from(getScaleChromaticInterpolates())
    .pipe(takeUntilDestroyed())
    .subscribe((interpolateGroups) => {
      this.interpolateGroups = interpolateGroups
    })

  private valueSub = this.formControl.valueChanges
    .pipe(distinctUntilChanged(isEqual), takeUntilDestroyed())
    .subscribe((value) => {
      this.onChange(value)
    })

  // ngOnInit(): void {
  //   // 初始化完成后再发送数据
  //   if (this.field?.props?.entitySet instanceof Observable) {
  //     this.field.props.entitySet.pipe(untilDestroyed(this)).subscribe((event) => this.entitySet$.next(event))
  //   } else if (this.field.props.entitySet) {
  //     this.entitySet$.next(this.field.props.entitySet)
  //   }

  //   if (this.field?.props?.entityType instanceof Observable) {
  //     this.field.props.entityType.pipe(untilDestroyed(this)).subscribe((event) => this.entityType$.next(event))
  //   } else if (this.field.props.entityType) {
  //     this.entityType$.next(this.field.props.entityType)
  //     // 注意: 这样的 of(event) 异步事件会紧跟着一个 complete 事件导致 this.entityType$ 被 Complete
  //     // of(this.field.props.entityType).subscribe(this.entityType$)
  //   }

  //   if (this.field?.props?.dataSettings instanceof Observable) {
  //     this.field.props.dataSettings.pipe(untilDestroyed(this)).subscribe((event) => this.dataSettings$.next(event))
  //   } else if (this.field?.props?.dataSettings) {
  //     this.dataSettings$.next(this.field.props.dataSettings)
  //   }

  //   if (this.field?.props?.restrictedDimensions instanceof Observable) {
  //     this.field.props.restrictedDimensions
  //       .pipe(untilDestroyed(this))
  //       .subscribe((event) => this.restrictedDimensions$.next(event))
  //   } else if (this.field?.props?.restrictedDimensions) {
  //     this.restrictedDimensions$.next(this.field.props.restrictedDimensions)
  //   }

  //   this.formControl.valueChanges
  //     .pipe(startWith(this.formControl.value), distinctUntilChanged(isEqual), untilDestroyed(this))
  //     .subscribe((value) => {
  //       this._formControl.setValue(value)
  //     })

  //   this._formControl.valueChanges.pipe(distinctUntilChanged(isEqual), untilDestroyed(this)).subscribe((value) => {
  //     this.patchValue(value || {})
  //   })
  // }

  onChange: (input: any) => void
  onTouched: () => void

  writeValue(obj: any): void {
    if (obj) {
      console.log('writeValue', obj)
      this.formControl.patchValue(obj)
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }

  patchValue(value) {
    this.formControl.setValue({
      ...(this.formControl.value || {}),
      ...value
    })
  }

  onCalculationChange(property: CalculationProperty) {
    this.coreService.storyUpdateEvent$.next({
      type: 'Calculation',
      dataSettings: this.dataSettings,
      property
    })
  }

  async openReferenceLine() {
    const title = await firstValueFrom(
      this.translateService.get('FORMLY.PROPERTY_SELECT.REFERENCE_LINE', { Default: 'Reference Lines' })
    )
    this.referenceLineSubscription?.unsubscribe()
    this.referenceLineSubscription = this.settingsService
      ?.openSecondDesigner(
        'MeasureReferenceLine',
        { referenceLines: this.formControl.value?.referenceLines ?? [] },
        title,
        true
      )
      .subscribe((result) => {
        if (result) {
          this.patchValue({
            referenceLines: result.referenceLines
          })
        }
      })
  }

  async openChartOptions() {
    const title = await firstValueFrom(
      this.translateService.get('FORMLY.PROPERTY_SELECT.ChartOptions', { Default: 'Chart Options' })
    )
    // 优先使用本度量的形状属性作为图形类型
    let chartType: ChartType // = await firstValueFrom(this.field?.props?.chartType$ ?? of({}))
    if (this.shapeType) {
      chartType = { ...chartType, type: startCase(this.shapeType) }
    }

    this.chartOptionsSubscription?.unsubscribe()
    this.chartOptionsSubscription = this.settingsService
      ?.openSecondDesigner(
        'MeasureChartOptions',
        {
          chartType,
          chartOptions: this.formControl.value?.chartOptions ?? {}
        },
        title,
        true
      )
      .subscribe((result) => {
        if (result) {
          this.patchValue({
            chartOptions: result.chartOptions
          })
        }
      })
  }

  async editAttributes() {
    const title = await firstValueFrom(
      this.translateService.get('FORMLY.PROPERTY_SELECT.ChartAttributes', { Default: 'Chart Attributes' })
    )

    this.editAttributesSubscription?.unsubscribe()
    this.editAttributesSubscription = this.settingsService
      ?.openSecondDesigner(
        'DimensionChartOptions',
        {
          chartOptions: this.formControl.value?.chartOptions ?? {}
        },
        title,
        true
      )
      .subscribe((result) => {
        if (result) {
          this.patchValue({
            chartOptions: result.chartOptions
          })
        }
      })
  }

  onColorsChange(colors: string[]) {
    this.patchValue({
      palette: {
        ...(this.formControl.value?.palette ?? {}),
        name: null
      }
    })
  }
}
